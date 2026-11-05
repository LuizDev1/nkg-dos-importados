import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCarrinho } from '../../contextos/ContextoCarrinho';
import { useAutenticacao } from '../../contextos/ContextoAutenticacao';
import { criarPedido } from '../../servicos/pedidoService';
import { cotarFrete } from '../../servicos/freteService';
import { listarEnderecos } from '../../servicos/enderecoService';
import { formatarCep, formatarCpf, formatarTelefone } from '../../servicos/formatadores';

const API_URL = import.meta.env.VITE_API_URL || '/api';
// Ordem visual dos campos validados: o foco vai para o primeiro com erro.
const ORDEM_CAMPOS = ['telefone', 'cep', 'rua', 'numero', 'bairro', 'cidade', 'estado'];

export default function Checkout() {
  const { itens, carregandoEstoque, erroEstoque } = useCarrinho();
  const { usuario } = useAutenticacao();
  const navigate = useNavigate();

  const [formulario, setFormulario] = useState({
    cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', telefone: ''
  });
  const [enderecosSalvos, setEnderecosSalvos] = useState([]);
  const [enderecoSelecionadoId, setEnderecoSelecionadoId] = useState('');
  const [carregandoEnderecos, setCarregandoEnderecos] = useState(true);
  const [erroEnderecos, setErroEnderecos] = useState('');
  const [mostrarEnderecos, setMostrarEnderecos] = useState(false);
  const [erros, setErros] = useState({});
  const [carregando, setCarregando] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [erro, setErro] = useState('');
  const [pedidoEmProcessamento, setPedidoEmProcessamento] = useState(false);
  const [resumoServidor, setResumoServidor] = useState(null);
  const [codigoPromocao, setCodigoPromocao] = useState('');
  const [cpf, setCpf] = useState('');
  const [cotacaoFrete, setCotacaoFrete] = useState(null);
  const [freteServicoId, setFreteServicoId] = useState('');
  const versaoCep = useRef(0);
  const idempotencyKey = useRef(
    `checkout-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );

  useEffect(() => {
    if (itens.length === 0) {
      navigate('/');
    }
  }, [itens.length, navigate]);

  useEffect(() => { if (usuario?.cpf) setCpf(formatarCpf(usuario.cpf)); }, [usuario]);

  useEffect(() => {
    let ativo = true;
    listarEnderecos().then((enderecos) => {
      if (!ativo) return;
      setEnderecosSalvos(enderecos);
      const principal = enderecos.find((endereco) => endereco.principal) || enderecos[0];
      if (principal) usarEndereco(principal);
    }).catch(() => { if (ativo) setErroEnderecos('Não foi possível carregar seus endereços salvos. Atualize a página para tentar novamente.'); })
      .finally(() => { if (ativo) setCarregandoEnderecos(false); });
    return () => { ativo = false; };
  }, []);

  function usarEndereco(endereco) {
    versaoCep.current += 1;
    setEnderecoSelecionadoId(String(endereco.id));
    setFormulario((atual) => ({
      ...atual, cep: formatarCep(endereco.cep), rua: endereco.rua || '', numero: endereco.numero || '',
      complemento: endereco.complemento || '', bairro: endereco.bairro || '', cidade: endereco.cidade || '',
      estado: endereco.estado || '', telefone: endereco.telefone ? formatarTelefone(endereco.telefone) : atual.telefone,
    }));
    setCotacaoFrete(null);
    setFreteServicoId('');
  }

  if (itens.length === 0 || !usuario) return null;

  async function buscarCep(cep) {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;

    setBuscandoCep(true);
    setErros(atual => ({ ...atual, cep: '' }));

    try {
      const resposta = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const dados = await resposta.json();

      if (dados.erro) {
        setErros(atual => ({ ...atual, cep: 'CEP não encontrado' }));
        return;
      }

      setFormulario(atual => ({
        ...atual,
        rua: dados.logradouro || atual.rua,
        bairro: dados.bairro || atual.bairro,
        cidade: dados.localidade || atual.cidade,
        estado: dados.uf || atual.estado,
      }));

      setErros(atual => ({ ...atual, rua: '', bairro: '', cidade: '', estado: '' }));
    } catch {
      setErros(atual => ({ ...atual, cep: 'Erro ao buscar CEP. Preencha manualmente.' }));
    } finally {
      setBuscandoCep(false);
    }
  }

  function validarCampos() {
    const novosErros = {};

    if (!formulario.telefone.trim()) {
      novosErros.telefone = 'Telefone obrigatório';
    } else if (!/^\(?\d{2}\)?[\s-]?\d{4,5}-?\d{4}$/.test(formulario.telefone.replace(/\s/g, ''))) {
      novosErros.telefone = 'Telefone inválido. Ex: (61) 90000-0000';
    }

    if (!formulario.cep.trim()) {
      novosErros.cep = 'CEP obrigatório';
    } else if (!/^\d{5}-?\d{3}$/.test(formulario.cep)) {
      novosErros.cep = 'CEP inválido. Ex: 70000-000';
    }

    if (!formulario.rua.trim()) novosErros.rua = 'Rua obrigatória';
    if (!formulario.numero.trim()) novosErros.numero = 'Número obrigatório';
    if (!formulario.bairro.trim()) novosErros.bairro = 'Bairro obrigatório';
    if (!formulario.cidade.trim()) novosErros.cidade = 'Cidade obrigatória';

    if (!formulario.estado.trim()) {
      novosErros.estado = 'Estado obrigatório';
    } else if (!/^[A-Za-z]{2}$/.test(formulario.estado)) {
      novosErros.estado = 'Use a sigla do estado. Ex: DF';
    }

    setErros(novosErros);
    const primeiroInvalido = ORDEM_CAMPOS.find((campo) => novosErros[campo]);
    if (primeiroInvalido) document.getElementById(`checkout-${primeiroInvalido}`)?.focus();
    return Object.keys(novosErros).length === 0;
  }

  function lidarComMudanca(e) {
    const { name, value } = e.target;
    setEnderecoSelecionadoId('');
    const formatado = name === 'telefone' ? formatarTelefone(value) : name === 'estado' ? value.replace(/[^a-z]/gi, '').slice(0, 2).toUpperCase() : value;
    setFormulario(atual => ({ ...atual, [name]: formatado }));
    if (erros[name]) {
      setErros(atual => ({ ...atual, [name]: '' }));
    }
  }

  function lidarComCep(e) {
    const { value } = e.target;
    versaoCep.current += 1;
    setEnderecoSelecionadoId('');
    setFormulario(atual => ({ ...atual, cep: formatarCep(value) }));
    setCotacaoFrete(null);
    setFreteServicoId('');
    if (erros.cep) setErros(atual => ({ ...atual, cep: '' }));

    const cepLimpo = value.replace(/\D/g, '');
    if (cepLimpo.length === 8) {
      buscarCep(value);
    }
  }

  async function finalizarCompra(e) {
    e.preventDefault();

    if (carregandoEstoque || erroEstoque || itens.some(item => !item.estoque_qtd || item.quantidade < 1) || pedidoEmProcessamento || !validarCampos()) {
      return;
    }

    setCarregando(true);
    setPedidoEmProcessamento(true);
    setErro('');

    try {
      const enderecoCompleto = `${formulario.rua}, ${formulario.numero}${formulario.complemento ? ` - ${formulario.complemento}` : ''} - ${formulario.bairro}, ${formulario.cidade} - ${formulario.estado}, CEP: ${formulario.cep}`;
      const itensFrete = itens.map(item => ({
        produto_id: item.produto_id,
        quantidade: item.quantidade,
      }));
      const precisaConfirmarFrete = !cotacaoFrete;
      const versao = versaoCep.current;
      const cotacao = await cotarFrete(formulario.cep, itensFrete, freteServicoId);
      if (versao !== versaoCep.current) return;
      setCotacaoFrete(cotacao);

      if (precisaConfirmarFrete) {
        setFreteServicoId(cotacao.servico_id);
        return;
      }

      const payload = {
        tipo_entrega: 'envio',
        cep_entrega: formulario.cep,
        frete_servico_id: cotacao.servico_id,
        endereco_entrega: enderecoCompleto,
        telefone_contato: formulario.telefone,
        ...(codigoPromocao.trim() ? { codigo_promocao: codigoPromocao.trim() } : {}),
        itens: itens.map(item => ({
          produto_id: item.produto_id,
          variacao_id: item.variacao_id || undefined,
          tamanho: item.tamanho || undefined,
          quantidade: item.quantidade,
          preco_unitario: Number(item.preco),
        }))
      };

      const respostaCpf = await fetch(`${API_URL}/usuarios/${usuario.id}/cpf`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf }),
      });
      if (!respostaCpf.ok) {
        const dadosCpf = await respostaCpf.json();
        throw new Error(dadosCpf.mensagem || 'Erro ao atualizar CPF');
      }
      const respostaPedido = await criarPedido(payload, idempotencyKey.current);
      setResumoServidor(respostaPedido);
      localStorage.setItem('pedido_pendente_carrinho', String(respostaPedido.id));

      const respostaPagamento = await fetch(`${API_URL}/pagamentos/${respostaPedido.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const dadosPagamento = await respostaPagamento.json();

      if (!respostaPagamento.ok) {
        throw new Error(dadosPagamento.mensagem || 'Erro ao gerar link de pagamento');
      }

      window.location.href = dadosPagamento.checkout_url;

    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
      setPedidoEmProcessamento(false);
    }
  }

  function classeCampo(campo) {
    return `w-full border rounded px-3 py-2 text-base sm:text-sm ${erros[campo] ? 'focus:outline-none focus:ring-1 focus:ring-erro' : ''}`;
  }

  // id, name e ligação com a mensagem de erro de cada campo validado.
  function propsCampo(campo) {
    return {
      id: `checkout-${campo}`,
      name: campo,
      'aria-invalid': erros[campo] ? 'true' : undefined,
      'aria-describedby': erros[campo] ? `checkout-${campo}-erro` : undefined,
    };
  }

  function erroCampo(campo) {
    return erros[campo] ? <p id={`checkout-${campo}-erro`} className="mt-1 text-sm text-erro">{erros[campo]}</p> : null;
  }

  const rotulo = 'block text-sm text-gray-600';

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold">Finalizar Compra</h1>
        <button
          type="button"
          onClick={() => navigate('/carrinho')}
          className="botao-voltar"
        >
          ← Voltar ao carrinho
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Resumo do Pedido</h2>
        <p className="text-gray-600 mb-2">Quantidade de itens: {itens.length}</p>
        {resumoServidor ? (
          <div className="text-gray-700 space-y-1">
            <p>Subtotal: {Number(resumoServidor.subtotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
            <p>Frete: {Number(resumoServidor.frete).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
            <p className="text-xl font-bold text-blue-600">Total confirmado: {Number(resumoServidor.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
          </div>
        ) : (
          <div className="text-gray-600">
            {!cotacaoFrete && <p>Frete calculado no servidor ao finalizar</p>}
            {cotacaoFrete && cotacaoFrete.opcoes?.length > 1 && (
              <fieldset className="mt-3">
                <legend className="mb-2 text-sm font-semibold text-gray-700">Escolha a entrega</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {cotacaoFrete.opcoes.map((opcao) => (
                    <label
                      key={opcao.servico_id}
                      className={`cursor-pointer rounded-lg border p-3 transition ${
                        freteServicoId === opcao.servico_id
                          ? 'border-acao bg-blue-50 ring-1 ring-acao'
                          : 'border-borda-campo hover:border-link'
                      }`}
                    >
                      <input
                        type="radio"
                        name="frete"
                        value={opcao.servico_id}
                        checked={freteServicoId === opcao.servico_id}
                        onChange={() => {
                          setFreteServicoId(opcao.servico_id);
                          setCotacaoFrete((atual) => ({ ...atual, ...opcao }));
                        }}
                        className="mr-2"
                      />
                      <span className="font-semibold">
                        {opcao.nome_exibicao || `${opcao.transportadora} - ${opcao.servico_nome}`}
                      </span>
                      <span className="mt-1 block text-sm text-gray-600">
                        {Number(opcao.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        {' · '}até {opcao.prazo_dias} dias
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
            {cotacaoFrete?.gratuito ? (
              <p className="mt-2 font-semibold text-sucesso">Entrega grátis</p>
            ) : cotacaoFrete ? (
              <p className="mt-2">
                Frete: {Number(cotacaoFrete.valor).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </p>
            ) : null}
          </div>
        )}
      </div>

      <form onSubmit={finalizarCompra} className="bg-white p-6 rounded-lg shadow space-y-4">
        <h2 className="text-lg font-semibold mb-2">Dados de Entrega</h2>

        {/* Região estável para falhas gerais (frete, pedido, pagamento). */}
        <div role="alert" className={erro ? 'rounded border border-erro-borda bg-erro-fundo p-3 text-[#fca5a5]' : ''}>{erro}</div>

        <div role="status" className={carregandoEnderecos ? 'text-sm text-gray-500' : 'sr-only'}>
          {carregandoEnderecos ? 'Carregando endereço principal...' : ''}
        </div>
        {erroEnderecos && <p role="alert" className="rounded border border-aviso-borda bg-aviso-fundo p-3 text-sm text-aviso-texto">{erroEnderecos}</p>}

        <div>
          <label htmlFor="cpf-pagamento" className={rotulo}>CPF do comprador</label>
          <input id="cpf-pagamento" name="cpf" type="text" inputMode="numeric" autoComplete="off" value={cpf}
            onChange={(e) => setCpf(formatarCpf(e.target.value))} required maxLength={14}
            placeholder="000.000.000-00" aria-describedby="cpf-pagamento-ajuda" className={classeCampo('cpf')} />
          <p id="cpf-pagamento-ajuda" className="text-xs text-gray-500 mt-1">Necessário para identificar o comprador no pagamento.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="checkout-telefone" className={rotulo}>Telefone de Contato</label>
            <input type="tel" inputMode="tel" autoComplete="tel" {...propsCampo('telefone')} value={formulario.telefone} onChange={lidarComMudanca} className={classeCampo('telefone')} placeholder="(61) 90000-0000" />
            {erroCampo('telefone')}
          </div>
          <div>
            <label htmlFor="checkout-cep" className={rotulo}>CEP</label>
            <div className="relative">
              <input type="text" inputMode="numeric" autoComplete="postal-code" {...propsCampo('cep')} value={formulario.cep} onChange={lidarComCep} className={classeCampo('cep')} placeholder="00000-000" maxLength="9" />
              {buscandoCep && (
                <span role="status" className="absolute right-3 top-2.5 text-xs text-gray-400">Buscando...</span>
              )}
            </div>
            {erroCampo('cep')}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label htmlFor="checkout-rua" className={rotulo}>Rua / Quadra</label>
            <input type="text" autoComplete="address-line1" {...propsCampo('rua')} value={formulario.rua} onChange={lidarComMudanca} className={classeCampo('rua')} />
            {erroCampo('rua')}
          </div>
          <div>
            <label htmlFor="checkout-numero" className={rotulo}>Número</label>
            <input type="text" inputMode="numeric" {...propsCampo('numero')} value={formulario.numero} onChange={lidarComMudanca} className={classeCampo('numero')} />
            {erroCampo('numero')}
          </div>
        </div>

        <div>
          <label htmlFor="checkout-complemento" className={rotulo}>Complemento</label>
          <input type="text" id="checkout-complemento" name="complemento" autoComplete="address-line2" value={formulario.complemento} onChange={lidarComMudanca} className={classeCampo('complemento')} placeholder="Apartamento, bloco, referência..." />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="checkout-bairro" className={rotulo}>Bairro</label>
            <input type="text" autoComplete="address-level3" {...propsCampo('bairro')} value={formulario.bairro} onChange={lidarComMudanca} className={classeCampo('bairro')} />
            {erroCampo('bairro')}
          </div>
          <div>
            <label htmlFor="checkout-cidade" className={rotulo}>Cidade</label>
            <input type="text" autoComplete="address-level2" {...propsCampo('cidade')} value={formulario.cidade} onChange={lidarComMudanca} className={classeCampo('cidade')} />
            {erroCampo('cidade')}
          </div>
        </div>

        <div>
          <label htmlFor="checkout-estado" className={rotulo}>Estado (UF)</label>
          <input type="text" autoComplete="address-level1" {...propsCampo('estado')} value={formulario.estado} onChange={lidarComMudanca} className={classeCampo('estado')} placeholder="Ex: DF" maxLength="2" />
          {erroCampo('estado')}
        </div>

        {enderecosSalvos.length > 0 && (
          <div className="rounded border border-gray-200 bg-gray-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div><p className="font-semibold text-gray-800">{enderecoSelecionadoId ? 'Endereço salvo aplicado' : 'Endereços salvos'}</p><p className="text-xs text-gray-600">{enderecoSelecionadoId ? 'Você pode revisar os campos acima antes de finalizar.' : 'Selecione um endereço para preencher os campos.'}</p></div>
              {(enderecosSalvos.length > 1 || !enderecoSelecionadoId) && <button type="button" onClick={() => setMostrarEnderecos((aberto) => !aberto)} aria-expanded={mostrarEnderecos} className="text-sm font-semibold text-link underline underline-offset-2">{mostrarEnderecos ? 'Fechar opções' : 'Trocar endereço salvo'}</button>}
            </div>
            {(mostrarEnderecos || enderecosSalvos.length === 1 || !enderecoSelecionadoId) && (
              <div className="mt-3 grid gap-2">
                {enderecosSalvos.map((endereco) => <button key={endereco.id} type="button" onClick={() => { usarEndereco(endereco); setMostrarEnderecos(false); }} className={`rounded border p-3 text-left text-sm ${String(endereco.id) === enderecoSelecionadoId ? 'border-acao bg-blue-50' : 'border-borda-campo bg-white hover:border-link'}`} aria-pressed={String(endereco.id) === enderecoSelecionadoId}><strong>{endereco.apelido}{endereco.principal ? ' · Principal' : ''}</strong><span className="mt-1 block text-gray-600">{endereco.rua}, {endereco.numero}{endereco.complemento ? ` — ${endereco.complemento}` : ''} · {endereco.cidade}/{endereco.estado}</span></button>)}
              </div>
            )}
          </div>
        )}

        <div>
          <label htmlFor="checkout-cupom" className={rotulo}>Cupom de desconto</label>
          <input
            id="checkout-cupom"
            name="codigo_promocao"
            type="text"
            autoComplete="off"
            value={codigoPromocao}
            onChange={(e) => setCodigoPromocao(e.target.value.toUpperCase())}
            className={classeCampo('codigoPromocao')}
            placeholder="Opcional"
            maxLength="50"
          />
        </div>

        <button 
          type="submit" 
          disabled={carregando || buscandoCep || carregandoEstoque || Boolean(erroEstoque) || itens.some(item => !item.estoque_qtd || item.quantidade < 1)}
          className="w-full py-3 rounded bg-acao text-acao-texto font-bold mt-4 transition hover:bg-acao-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {carregando
            ? 'Processando...'
            : buscandoCep
              ? 'Buscando CEP...'
              : cotacaoFrete && freteServicoId
                ? 'Ir para o Pagamento'
                : 'Calcular frete'}
        </button>
      </form>
    </div>
  );
}
