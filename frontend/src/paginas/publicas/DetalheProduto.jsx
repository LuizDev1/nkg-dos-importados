import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { buscarProduto, listarProdutos } from '../../servicos/produtoService';
import { cotarFrete } from '../../servicos/freteService';
import { useCarrinho } from '../../contextos/ContextoCarrinho';
import { useAutenticacao } from '../../contextos/ContextoAutenticacao';
import CartaoProduto from '../../componentes/CartaoProduto';
import { useFavoritos } from '../../contextos/ContextoFavoritos';
import { cadastrarAvisoEstoque } from '../../servicos/avisoEstoqueService';
import { listarAvaliacoes, salvarAvaliacao, verificarPermissaoAvaliacao, marcarAvaliacaoUtil } from '../../servicos/avaliacaoService';
import PerguntasProduto from '../../componentes/PerguntasProduto';

export default function DetalheProduto() {
  const { id } = useParams();
  const [produto, setProduto] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [adicionado, setAdicionado] = useState(false);
  const [relacionados, setRelacionados] = useState([]);
  const [cep, setCep] = useState('');
  const [cotacao, setCotacao] = useState(null);
  const [calculandoFrete, setCalculandoFrete] = useState(false);
  const [erroFrete, setErroFrete] = useState('');
  const [corSelecionada, setCorSelecionada] = useState('');
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState('');
  const [variacaoId, setVariacaoId] = useState('');
  const [avisoEstoque, setAvisoEstoque] = useState('');
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [formAvaliacao, setFormAvaliacao] = useState({ nota: 5, comentario: '', fotos: [], anonimo: false });
  const [mensagemAvaliacao, setMensagemAvaliacao] = useState('');
  const [salvandoAvaliacao, setSalvandoAvaliacao] = useState(false);
  const [podeAvaliar, setPodeAvaliar] = useState(false);
  const [lendoFotos, setLendoFotos] = useState(false);
  const [votandoUtil, setVotandoUtil] = useState(null);
  const [erroUtil, setErroUtil] = useState('');
  const [imagemSelecionada, setImagemSelecionada] = useState('');
  const [avaliacoesAbertas, setAvaliacoesAbertas] = useState(true);

  const { adicionarItem } = useCarrinho();
  const { usuario } = useAutenticacao();
  const { estaFavorito, alternarFavorito } = useFavoritos();
  const navigate = useNavigate();
  const freteVersao = useRef(0);
  const paginaVersao = useRef(0);
  const timerAdicionado = useRef(null);
  const [erroCarrinho, setErroCarrinho] = useState('');

  useEffect(() => {
    let ativo = true;
    paginaVersao.current += 1;
    clearTimeout(timerAdicionado.current);
    setSalvandoAvaliacao(false);
    setLendoFotos(false);
    freteVersao.current += 1;
    setCalculandoFrete(false);
    setErroFrete('');
    setAvisoEstoque('');
    setMensagemAvaliacao('');
    setErroUtil('');
    setVotandoUtil(null);
    setFormAvaliacao({ nota: 5, comentario: '', fotos: [], anonimo: false });
    setAdicionado(false);
    setErroCarrinho('');
    setAvaliacoesAbertas(true);
    async function carregar() {
      setCarregando(true);
      setErro('');
      setRelacionados([]);
      setPodeAvaliar(false);
      try {
        const dados = await buscarProduto(id);
        if (!ativo) return;
        setProduto(dados);
        setImagemSelecionada(dados.foto_url || dados.imagens?.[0]?.imagem_url || '');
        setQuantidade(1);
        setVariacaoId('');
        setCorSelecionada('');
        setTamanhoSelecionado('');
        setCotacao(null);

        try {
          const lista = await listarAvaliacoes(id);
          if (!ativo) return;
          setAvaliacoes(lista);
        } catch {
          if (!ativo) return;
          setAvaliacoes([]);
        }

        if (usuario && usuario.perfil !== 'admin') {
          try {
            const permissao = await verificarPermissaoAvaliacao(id);
            if (!ativo) return;
            setPodeAvaliar(Boolean(permissao.pode_avaliar));
          } catch {
            if (!ativo) return;
            setPodeAvaliar(false);
          }
        } else {
          setPodeAvaliar(false);
        }

        if (dados?.categoria) {
          try {
            const produtosRelacionados = await listarProdutos({ categoria: dados.categoria });
            if (!ativo) return;
            setRelacionados(
              produtosRelacionados.filter((item) => String(item.id) !== String(dados.id)).slice(0, 4)
            );
          } catch {
            if (!ativo) return;
            setRelacionados([]);
          }
        } else {
          setRelacionados([]);
        }
      } catch (erro) {
        if (ativo) setErro(erro.message);
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregar();
    return () => { ativo = false; freteVersao.current += 1; paginaVersao.current += 1; clearTimeout(timerAdicionado.current); };
  }, [id, usuario]);

  function escolherOpcao(cor, tamanho) {
    setCorSelecionada(cor);
    setTamanhoSelecionado(tamanho);
    const tamanhoValido = !produto.tamanhos?.length || produto.tamanhos.includes(tamanho);
    const variacao = tamanhoValido ? (produto.variacoes || []).find(v => v.nome === cor && (v.tamanho || '') === tamanho) : null;
    const somenteTamanhos = !produto.variacoes?.length && produto.tamanhos?.length;
    setVariacaoId(variacao ? String(variacao.id) : (somenteTamanhos && tamanho ? `tamanho:${tamanho}` : ''));
    freteVersao.current += 1;
    setCalculandoFrete(false);
    setQuantidade(1);
    setCotacao(null);
    setAvisoEstoque('');
    setErroCarrinho('');
  }

  function alternarCor(cor) {
    escolherOpcao(corSelecionada === cor ? '' : cor, tamanhoSelecionado);
  }

  function alternarTamanho(tamanho) {
    escolherOpcao(corSelecionada, tamanhoSelecionado === tamanho ? '' : tamanho);
  }

  function aoAdicionar() {
    if (produto.ativo === false || Number(produto.ativo) === 0) {
      setErroCarrinho('Este produto está inativo e não pode ser comprado.');
      return;
    }
    let variacao = (produto.variacoes || []).find(
      (item) => String(item.id) === variacaoId
    );
    if (!variacao && variacaoId.startsWith('tamanho:') && !produto.variacoes?.length) {
      variacao = { nome: '', tamanho: variacaoId.split(':')[1], estoque_qtd: produto.estoque_qtd };
    }

    const estoque = Number(variacao ? variacao.estoque_qtd : produto.estoque_qtd);
    if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > estoque || !Number.isFinite(estoque)
      || (produto.tamanhos?.length && !produto.tamanhos.includes(variacao?.tamanho))
      || ((produto.variacoes?.length || produto.tamanhos?.length) && !variacao)) {
      setErroCarrinho('Escolha uma variação e uma quantidade válida dentro do estoque.');
      return;
    }
    setErroCarrinho('');
    adicionarItem(produto, quantidade, variacao || null);

    if (!usuario) {
      navigate('/login', { state: { from: '/carrinho' } });
      return;
    }

    setAdicionado(true);
    clearTimeout(timerAdicionado.current);
    timerAdicionado.current = setTimeout(() => setAdicionado(false), 1200);
  }

  async function calcularFrete(evento) {
    evento.preventDefault();
    setErroFrete('');
    setCotacao(null);

    if (!/^\d{5}-?\d{3}$/.test(cep)) {
      setErroFrete('Informe um CEP válido.');
      return;
    }

    const versao = ++freteVersao.current;
    setCalculandoFrete(true);
    try {
      const resultado = await cotarFrete(cep, [{
        produto_id: produto.id,
        quantidade,
      }]);
      if (versao === freteVersao.current) setCotacao(resultado);
    } catch (erro) {
      if (versao === freteVersao.current) setErroFrete(erro.message);
    } finally {
      if (versao === freteVersao.current) setCalculandoFrete(false);
    }
  }

  async function solicitarAviso() {
    if (!usuario) {
      navigate('/login');
      return;
    }
    const versao = paginaVersao.current;
    try {
      const resposta = await cadastrarAvisoEstoque(produto.id, variacaoSelecionada?.id);
      if (versao === paginaVersao.current) setAvisoEstoque(resposta.mensagem);
    } catch (erroAviso) {
      if (versao === paginaVersao.current) setAvisoEstoque(erroAviso.message);
    }
  }

  async function selecionarFotos(evento) {
    if (lendoFotos || salvandoAvaliacao) return;
    const arquivos = Array.from(evento.target.files || []);
    evento.target.value = '';
    if (arquivos.length + formAvaliacao.fotos.length > 5) {
      setMensagemAvaliacao('Selecione no máximo 5 fotos.');
      return;
    }
    if (arquivos.some(f => !['image/jpeg', 'image/png', 'image/webp'].includes(f.type) || f.size > 1024 * 1024)) {
      setMensagemAvaliacao('Use fotos JPG, PNG ou WebP de até 1 MB cada.');
      return;
    }
    const versao = paginaVersao.current;
    setLendoFotos(true);
    try {
      const fotos = await Promise.all(arquivos.map(arquivo => new Promise((resolve, reject) => {
        const leitor = new FileReader();
        leitor.onload = () => resolve(leitor.result);
        leitor.onerror = reject;
        leitor.readAsDataURL(arquivo);
      })));
      if (versao !== paginaVersao.current) return;
      setFormAvaliacao(atual => ({ ...atual, fotos: [...atual.fotos, ...fotos].slice(0, 5) }));
      setMensagemAvaliacao('');
    } catch {
      if (versao === paginaVersao.current) setMensagemAvaliacao('Erro ao ler fotos. Tente novamente.');
    } finally {
      if (versao === paginaVersao.current) setLendoFotos(false);
    }
  }

  async function enviarAvaliacao(evento) {
    evento.preventDefault();
    if (lendoFotos || salvandoAvaliacao) return;
    const versao = paginaVersao.current;
    setSalvandoAvaliacao(true);
    setMensagemAvaliacao('');
    try {
      const resposta = await salvarAvaliacao(produto.id, {
        ...formAvaliacao,
        nota: Number(formAvaliacao.nota),
        fotos: formAvaliacao.fotos,
      });
      if (versao !== paginaVersao.current) return;
      setMensagemAvaliacao(resposta.mensagem);
      setPodeAvaliar(false);
      const lista = await listarAvaliacoes(produto.id);
      if (versao !== paginaVersao.current) return;
      setAvaliacoes(lista);
      setFormAvaliacao({ nota: 5, comentario: '', fotos: [], anonimo: false });
    } catch (erroAvaliacao) {
      if (versao === paginaVersao.current) setMensagemAvaliacao(erroAvaliacao.message);
    } finally {
      if (versao === paginaVersao.current) setSalvandoAvaliacao(false);
    }
  }

  async function votarUtil(avaliacaoId) {
    if (!usuario) {
      navigate('/login', { state: { from: '/produto/' + id } });
      return;
    }
    if (votandoUtil !== null) return;
    const versao = paginaVersao.current;
    setVotandoUtil(avaliacaoId);
    setErroUtil('');
    try {
      const avaliacao = avaliacoes.find(a => a.id === avaliacaoId);
      const dados = await marcarAvaliacaoUtil(avaliacaoId, !avaliacao?.votou_util);
      if (versao !== paginaVersao.current) return;
      setAvaliacoes(atuais => atuais.map(a => a.id === avaliacaoId ? { ...a, uteis: dados.uteis, votou_util: dados.votou_util } : a));
    } catch (erro) {
      if (versao === paginaVersao.current) setErroUtil(erro.message);
    } finally {
      if (versao === paginaVersao.current) setVotandoUtil(null);
    }
  }

  if (carregando) return <p className="text-center mt-10">Carregando produto...</p>;
  if (erro) return <p className="text-center mt-10 text-red-600">{erro}</p>;
  if (!produto) return null;
  const variacaoSelecionada = (produto.variacoes || []).find((item) => String(item.id) === variacaoId)
    || (variacaoId.startsWith('tamanho:') && !produto.variacoes?.length
      ? { nome: '', tamanho: variacaoId.split(':')[1], estoque_qtd: produto.estoque_qtd }
      : null);
  const estoqueTotalVariacoes = (produto.variacoes || []).reduce((total, variacao) => total + (variacao.ativo === false ? 0 : Number(variacao.estoque_qtd || 0)), 0);
  const estoqueFiltrado = (produto.variacoes || []).filter(variacao =>
    (!corSelecionada || variacao.nome === corSelecionada) &&
    (!tamanhoSelecionado || variacao.tamanho === tamanhoSelecionado)
  ).reduce((total, variacao) => total + Number(variacao.estoque_qtd || 0), 0);
  const estoqueSemSelecao = produto.variacoes?.length ? estoqueTotalVariacoes : Number(produto.estoque_qtd);
  const estoqueDisponivel = variacaoSelecionada ? Number(variacaoSelecionada.estoque_qtd || 0)
    : (corSelecionada || tamanhoSelecionado ? estoqueFiltrado : estoqueSemSelecao);
  const mediaAvaliacoes = avaliacoes.length
    ? avaliacoes.reduce((total, avaliacao) => total + Number(avaliacao.nota), 0) / avaliacoes.length
    : 0;
  const imagensProduto = [produto.foto_url, ...(produto.imagens || []).map((imagem) => imagem.imagem_url)]
    .filter((url, indice, lista) => url && lista.indexOf(url) === indice);
  const coresDisponiveis = [...new Set((produto.variacoes || []).map(v => v.nome).filter(Boolean))];
  const produtoAtivo = produto.ativo !== false && Number(produto.ativo) !== 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/" className="botao-voltar">
        &larr; Voltar para a loja
      </Link>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          {imagemSelecionada ? (
            <img src={imagemSelecionada} alt={produto.nome} className="h-80 w-full rounded-lg object-cover transition-opacity" />
          ) : (
            <div role="img" aria-label={`Imagem indisponível de ${produto.nome}`} className="flex h-80 w-full items-center justify-center rounded-lg bg-[#24251f] text-sm uppercase tracking-[0.18em] text-[#aaa396]">Sem imagem</div>
          )}
          {imagensProduto.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2" aria-label="Galeria do produto">
              {imagensProduto.map((url, indice) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setImagemSelecionada(url)}
                  className={`overflow-hidden rounded border ${imagemSelecionada === url ? 'border-[#d4af45]' : 'border-[#343024] hover:border-[#8b7437]'}`}
                  aria-label={`Ver foto ${indice + 1}`}
                >
                  <img src={url} alt="" className="h-16 w-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="mb-2 flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold">{produto.nome}</h1>
            {usuario?.perfil !== 'admin' && (
              <button
                type="button"
                onClick={() => usuario ? alternarFavorito(produto) : navigate('/login')}
                disabled={!produtoAtivo}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-lg disabled:cursor-not-allowed disabled:opacity-40 ${estaFavorito(produto.id) ? 'border-[#d4af45] bg-[#d4af45] text-[#090a09]' : 'border-[#3a3526] text-[#d4af45] hover:border-[#d4af45]'}`}
                aria-label={!produtoAtivo ? 'Produto inativo' : estaFavorito(produto.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                title={!produtoAtivo ? 'Produto inativo' : undefined}
              >
                {estaFavorito(produto.id) ? '♥' : '♡'}
              </button>
            )}
          </div>
          <p className="text-sm text-gray-500 mb-4">{produto.categoria}</p>
          <p className="text-2xl font-bold mb-4">
            {Number(produto.preco).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </p>

          {!produtoAtivo ? (
            <p className="mb-4 text-sm font-semibold text-red-500">Produto inativo e indisponível para compra</p>
          ) : estoqueDisponivel > 0 ? (
            <p className="text-sm text-green-600 mb-4">
              Em estoque ({estoqueDisponivel} disponíveis)
            </p>
          ) : (
            <p className="text-sm text-red-600 mb-4">Fora de estoque</p>
          )}

          {coresDisponiveis.length > 0 && (
            <div className="mb-4">
              <p id="cores-label" className="mb-2 text-sm font-medium">Escolha uma cor/variação:</p>
              <div className="flex flex-wrap gap-2" role="group" aria-labelledby="cores-label">
                {coresDisponiveis.map(cor => (
                  <button key={cor} type="button" aria-pressed={corSelecionada === cor} onClick={() => alternarCor(cor)} className={`rounded border px-3 py-2 text-sm font-semibold ${corSelecionada === cor ? 'border-[#d4af45] bg-[#d4af45] text-[#090a09]' : 'border-[#49422f] text-[#d4af45] hover:border-[#d4af45]'}`}>{cor}</button>
                ))}
              </div>
            </div>
          )}
          {produto.tamanhos?.length > 0 && (
            <div className="mb-4">
              <p id="tamanhos-label" className="mb-2 text-sm font-medium">Escolha um tamanho:</p>
              <div className="flex flex-wrap gap-2" role="group" aria-labelledby="tamanhos-label">
                {['PP','P','M','G','GG'].filter(t => produto.tamanhos.includes(t)).map(tamanho => {
                  const disponivel = produto.variacoes?.length
                    ? produto.variacoes.some(v => (!corSelecionada || v.nome === corSelecionada) && v.tamanho === tamanho && Number(v.estoque_qtd) > 0)
                    : Number(produto.estoque_qtd) > 0;
                  return <button key={tamanho} type="button" disabled={!disponivel && tamanhoSelecionado !== tamanho} aria-pressed={tamanhoSelecionado === tamanho} onClick={() => alternarTamanho(tamanho)} className={`rounded border px-3 py-2 text-sm font-semibold disabled:opacity-40 ${tamanhoSelecionado === tamanho ? 'border-[#d4af45] bg-[#d4af45] text-[#090a09]' : 'border-[#49422f] text-[#d4af45] hover:border-[#d4af45]'}`}>{tamanho}</button>;
                })}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 mb-4">
            <label className="text-sm font-medium">Quantidade:</label>
            <input
              type="number"
              min="1"
              max={estoqueDisponivel}
              disabled={!produtoAtivo || estoqueDisponivel === 0}
              value={quantidade}
              onChange={(e) => {
                const novaQuantidade = Number(e.target.value);
                setQuantidade(Math.min(Math.max(Math.trunc(novaQuantidade) || 1, 1), estoqueDisponivel));
                setCotacao(null);
                freteVersao.current += 1;
                setCalculandoFrete(false);
              }}
              className="w-20 border rounded px-2 py-1 text-center"
            />
          </div>

          <button
            onClick={aoAdicionar}
            disabled={!produtoAtivo || estoqueDisponivel === 0}
            className={`w-full py-3 rounded transition ${adicionado
                ? 'bg-green-600 text-white'
                : !produtoAtivo || estoqueDisponivel === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
          >
            {adicionado ? 'Adicionado!' : 'Adicionar ao carrinho'}
          </button>

          {erroCarrinho && <p role="alert" className="mt-2 text-sm text-red-600">{erroCarrinho}</p>}

          {produtoAtivo && ((produto.variacoes?.length > 0 && variacaoSelecionada && estoqueDisponivel === 0)
            || (!produto.variacoes?.length && estoqueDisponivel === 0)) && (
              <button
                type="button"
                onClick={solicitarAviso}
                className="mt-3 w-full rounded border border-[#d4af45] px-4 py-3 font-semibold text-[#d4af45] hover:bg-[#d4af45] hover:text-[#090a09]"
              >
                Avise-me quando estiver disponível
              </button>
            )}
          {avisoEstoque && <p className="mt-2 text-center text-sm text-[#c6c0b5]">{avisoEstoque}</p>}

          <div className="mt-6 border-t border-gray-200 pt-5">
            <h2 className="mb-3 font-semibold">Calcular entrega</h2>
            {usuario ? (
              <form onSubmit={calcularFrete} className="flex items-end gap-2">
                <label className="flex-1 min-w-0 text-sm text-[#aaa399]">
                  CEP de entrega
                  <input
                    type="text"
                    inputMode="numeric"
                    value={cep}
                    onChange={(evento) => {
                      const numeros = evento.target.value.replace(/\D/g, '').slice(0, 8);
                      freteVersao.current += 1;
                      setCotacao(null);
                      setErroFrete('');
                      setCalculandoFrete(false);
                      setCep(numeros.replace(/^(\d{5})(\d)/, '$1-$2'));
                    }}
                    placeholder="00000-000"
                    aria-label="CEP de entrega"
                    className="mt-2 w-full rounded border border-gray-300 px-3 py-2"
                  />
                </label>
                <button
                  type="submit"
                  disabled={calculandoFrete}
                  className="rounded border border-blue-600 px-4 py-2 text-blue-600 hover:bg-blue-50 disabled:opacity-60"
                >
                  {calculandoFrete ? 'Calculando...' : 'Calcular'}
                </button>
              </form>
            ) : (
              <p className="text-sm text-gray-600">
                <Link to="/login" className="text-blue-600 hover:underline">Entre na sua conta</Link>{' '}
                para calcular o prazo e o valor da entrega.
              </p>
            )}

            {erroFrete && <p className="mt-2 text-sm text-red-600">{erroFrete}</p>}
            {Boolean(cotacao?.gratuito) && (
              <p className="mt-3 rounded bg-green-50 p-3 text-sm font-semibold text-green-700">
                Entrega grátis
              </p>
            )}
            {cotacao && !cotacao.gratuito && (
              <div className="mt-3 space-y-2">
                {(cotacao.opcoes || [cotacao]).map((opcao) => (
                  <div
                    key={opcao.servico_id}
                    className="flex items-center justify-between rounded border border-gray-200 p-3 text-sm"
                  >
                    <div>
                      <p className="font-semibold">
                        {opcao.nome_exibicao || `${opcao.transportadora} - ${opcao.servico_nome}`}
                      </p>
                      <p className="text-gray-500">Até {opcao.prazo_dias} dias</p>
                    </div>
                    <strong>
                      {Number(opcao.valor).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </strong>
                  </div>
                ))}
              </div>
            )}
          </div>

          <ul className="mt-6 space-y-2 border-t border-gray-200 pt-5 text-sm text-gray-600">
            <li>Pagamento processado em ambiente seguro</li>
            <li>Estoque confirmado antes da finalização</li>
            <li>Trocas e devoluções conforme a política da loja</li>
          </ul>
        </div>
      </div>

      <section id="avaliacoes" className="mt-12 scroll-mt-24 border-t border-[#302b20] pt-8">
        <button type="button" onClick={() => setAvaliacoesAbertas(aberta => !aberta)} aria-expanded={avaliacoesAbertas} aria-controls="conteudo-avaliacoes" className="mb-6 flex w-full flex-wrap items-end justify-between gap-3 rounded-xl bg-[#11120f] px-5 py-4 text-left hover:bg-[#171813]">
          <h2 className="text-xl font-bold">Avaliações</h2>
          <div className="ml-auto flex items-center gap-3" aria-label={mediaAvaliacoes.toFixed(1) + ' de 5 estrelas'}>
            <span className="text-4xl font-bold leading-none text-[#d4af45]">
              {mediaAvaliacoes.toFixed(1)}
            </span>
            <div>
              <div className="relative w-fit text-xl leading-none tracking-[0.12em]" aria-hidden="true">
                <span className="text-[#45402f]">{'★'.repeat(5)}</span>
                <span
                  className="absolute inset-y-0 left-0 overflow-hidden whitespace-nowrap text-[#d4af45]"
                  style={{ width: (mediaAvaliacoes / 5) * 100 + '%' }}
                >
                  {'★'.repeat(5)}
                </span>
              </div>
              <p className="mt-1 text-xs text-[#aaa396]">
                {avaliacoes.length} {avaliacoes.length <= 1 ? 'Avaliação' : 'Avaliações'}
              </p>
            </div>
          </div>
          <span className={`text-2xl text-[#d4af45] transition-transform ${avaliacoesAbertas ? 'rotate-180' : ''}`} aria-hidden="true">⌄</span>
        </button>

        {avaliacoesAbertas && <div id="conteudo-avaliacoes">
        {avaliacoes.length === 0 ? (
          <p className="text-sm text-[#aaa396]">Ainda não há avaliações para este produto.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {avaliacoes.map((avaliacao) => (
              <article key={avaliacao.id} className="rounded-xl border border-[#302b20] bg-[#11120f] p-5">
                <div className="flex items-center justify-between gap-3">
                  <strong>{avaliacao.usuario_nome}</strong>
                  <span className="text-[#d4af45]">{'★'.repeat(Number(avaliacao.nota))}</span>
                </div>
                {avaliacao.comentario && <p className="mt-3 text-sm text-[#d1cabd]">{avaliacao.comentario}</p>}
                {avaliacao.fotos?.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {avaliacao.fotos.map((foto, indice) => <img key={indice} src={foto} alt={'Foto da avaliação ' + (indice + 1)} loading="lazy" className="max-h-72 w-full rounded-lg object-cover" />)}
                  </div>
                )}
                <time className="mt-3 block text-xs text-[#817b70]">{new Date(avaliacao.criado_em).toLocaleDateString('pt-BR')}</time>
                <button
                  type="button"
                  onClick={() => votarUtil(avaliacao.id)}
                  aria-pressed={Boolean(avaliacao.votou_util)}
                  disabled={votandoUtil !== null}
                  className={`mt-3 inline-flex items-center gap-2 rounded border px-3 py-1.5 text-sm disabled:opacity-50 ${avaliacao.votou_util ? 'border-[#d4af45] bg-[#d4af45] text-[#090a09]' : 'border-[#45402f] text-[#d4af45] hover:border-[#d4af45]'}`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                    <path d="M7 10v11H3V10h4ZM7 10l4-7a3 3 0 0 1 3 3v4h5a2 2 0 0 1 2 2l-2 7a2 2 0 0 1-2 2H7" />
                  </svg>
                  Útil ({Number(avaliacao.uteis || 0)})
                </button>
              </article>
            ))}
          </div>
        )}
        {erroUtil && <p role="alert" className="mt-3 text-sm text-red-600">{erroUtil}</p>}
        {mensagemAvaliacao && !podeAvaliar && <p role="status" className="mt-3 text-sm">{mensagemAvaliacao}</p>}
        {Boolean(podeAvaliar) && (
          <form onSubmit={enviarAvaliacao} className="mt-8 grid gap-4 rounded-xl border border-[#302b20] bg-[#11120f] p-5">
            <p className="font-semibold">Avalie este produto</p>
            <label className="text-sm">
              Nota
              <select
                value={formAvaliacao.nota}
                onChange={(evento) => setFormAvaliacao({ ...formAvaliacao, nota: evento.target.value })}
                className="mt-1 block w-full rounded border border-[#45402f] bg-[#181915] px-3 py-2"
              >
                {[5, 4, 3, 2, 1].map((nota) => <option key={nota} value={nota}>{'★'.repeat(nota)} ({nota})</option>)}
              </select>
            </label>
            <label className="text-sm">
              Comentário
              <textarea
                required
                maxLength="1000"
                value={formAvaliacao.comentario}
                onChange={(evento) => setFormAvaliacao({ ...formAvaliacao, comentario: evento.target.value })}
                className="mt-1 min-h-24 w-full rounded border border-[#45402f] bg-[#181915] px-3 py-2"
                placeholder="Conte como foi sua experiência"
              />
            </label>
            <div>
              <label htmlFor="fotos-avaliacao" className="block text-sm font-semibold">
                Compartilhe suas fotos (opcional)
              </label>
              <label htmlFor="fotos-avaliacao" className="mt-3 flex h-20 cursor-pointer items-center justify-center rounded border border-dashed border-[#45402f] bg-[#181915] text-[#d4af45] hover:border-[#d4af45]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M14 20H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l2-3h6l2 3h3a2 2 0 0 1 2 2v5" />
                  <circle cx="12" cy="12" r="4" /><path d="M19 16v6M16 19h6" />
                </svg>
                <span className="sr-only">Adicionar fotos</span>
              </label>
              <input id="fotos-avaliacao" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={selecionarFotos} disabled={lendoFotos || salvandoAvaliacao || formAvaliacao.fotos.length >= 5} className="sr-only" />
              <p className="mt-2 text-xs text-[#aaa396]">{formAvaliacao.fotos.length}/5 - JPG, PNG ou WebP</p>
              <div className="mt-3 flex flex-wrap gap-3">
                {formAvaliacao.fotos.map((foto, indice) => (
                  <div key={indice} className="relative">
                    <img src={foto} alt={'Foto selecionada ' + (indice + 1)} className="h-20 w-20 rounded object-cover" />
                    <button type="button" disabled={salvandoAvaliacao} onClick={() => setFormAvaliacao(atual => ({ ...atual, fotos: atual.fotos.filter((_, i) => i !== indice) }))} aria-label={'Remover foto ' + (indice + 1)} className="absolute -right-2 -top-2 rounded-full bg-[#11120f] px-2 text-[#d4af45]">×</button>
                  </div>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={formAvaliacao.anonimo} onChange={evento => setFormAvaliacao(atual => ({ ...atual, anonimo: evento.target.checked }))} className="accent-[#d4af45]" />
              Publicar como Anônimo
            </label>
            <button disabled={salvandoAvaliacao || lendoFotos} className="rounded bg-[#d4af45] px-5 py-3 font-semibold text-black hover:bg-[#e1c15b] disabled:opacity-60">
              {salvandoAvaliacao ? 'Salvando...' : 'Publicar avaliação'}
            </button>
            {mensagemAvaliacao && <p className="text-sm text-[#d8d1c4]">{mensagemAvaliacao}</p>}
          </form>
        )}
        </div>}

      </section>

      <PerguntasProduto produtoId={id} />

      {relacionados.length > 0 && (
        <section className="mt-12 border-t border-gray-200 pt-8">
          <h2 className="mb-5 text-xl font-bold">Produtos relacionados</h2>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {relacionados.map((item) => (
              <CartaoProduto key={item.id} produto={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
