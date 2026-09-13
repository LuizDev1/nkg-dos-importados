import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCarrinho } from '../../contextos/ContextoCarrinho';
import { useAutenticacao } from '../../contextos/ContextoAutenticacao';
import { criarPedido } from '../../servicos/pedidoService';

export default function Checkout() {
  const { itens, total } = useCarrinho();
  const { usuario } = useAutenticacao();
  const navigate = useNavigate();
  
  const [formulario, setFormulario] = useState({
    cep: '', rua: '', numero: '', bairro: '', cidade: '', estado: '', telefone: ''
  });
  const [erros, setErros] = useState({});
  const [carregando, setCarregando] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (itens.length === 0) {
      navigate('/');
    }
  }, [itens.length, navigate]);

  useEffect(() => {
    if (!usuario) {
      navigate('/login');
    }
  }, [usuario, navigate]);

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
    return Object.keys(novosErros).length === 0;
  }

  function lidarComMudanca(e) {
    const { name, value } = e.target;
    setFormulario(atual => ({ ...atual, [name]: value }));
    if (erros[name]) {
      setErros(atual => ({ ...atual, [name]: '' }));
    }
  }

  function lidarComCep(e) {
    const { value } = e.target;
    setFormulario(atual => ({ ...atual, cep: value }));
    if (erros.cep) setErros(atual => ({ ...atual, cep: '' }));

    const cepLimpo = value.replace(/\D/g, '');
    if (cepLimpo.length === 8) {
      buscarCep(value);
    }
  }

  async function finalizarCompra(e) {
    e.preventDefault();

    if (!validarCampos()) return;

    setCarregando(true);
    setErro('');

    try {
      const enderecoCompleto = `${formulario.rua}, ${formulario.numero} - ${formulario.bairro}, ${formulario.cidade} - ${formulario.estado}, CEP: ${formulario.cep}`;

      const payload = {
        usuario_id: usuario.id,
        tipo_entrega: 'envio',
        endereco_entrega: enderecoCompleto,
        telefone_contato: formulario.telefone,
        itens: itens.map(item => ({
          produto_id: item.produto_id,
          quantidade: item.quantidade
        }))
      };

      const respostaPedido = await criarPedido(payload);

      const token = localStorage.getItem('token');
      const respostaPagamento = await fetch(`http://localhost:3000/api/pagamentos/${respostaPedido.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
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
    }
  }

  function classeCampo(campo) {
    return `w-full border rounded px-3 py-2 ${erros[campo] ? 'border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500' : 'border-gray-300'}`;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Finalizar Compra</h1>
        <button
          type="button"
          onClick={() => navigate('/carrinho')}
          className="text-gray-500 hover:text-gray-800 transition"
        >
          ← Voltar ao carrinho
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Resumo do Pedido</h2>
        <p className="text-gray-600 mb-2">Quantidade de itens: {itens.length}</p>
        <p className="text-xl font-bold text-blue-600">
          Total: {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </p>
      </div>

      <form onSubmit={finalizarCompra} className="bg-white p-6 rounded-lg shadow space-y-4">
        <h2 className="text-lg font-semibold mb-2">Dados de Entrega</h2>
        
        {erro && <p className="text-red-600 bg-red-50 p-3 rounded">{erro}</p>}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600">Telefone de Contato</label>
            <input type="text" name="telefone" value={formulario.telefone} onChange={lidarComMudanca} className={classeCampo('telefone')} placeholder="(61) 90000-0000" />
            {erros.telefone && <p className="text-red-500 text-xs mt-1">{erros.telefone}</p>}
          </div>
          <div>
            <label className="block text-sm text-gray-600">CEP</label>
            <div className="relative">
              <input type="text" name="cep" value={formulario.cep} onChange={lidarComCep} className={classeCampo('cep')} placeholder="00000-000" maxLength="9" />
              {buscandoCep && (
                <span className="absolute right-3 top-2.5 text-xs text-gray-400">Buscando...</span>
              )}
            </div>
            {erros.cep && <p className="text-red-500 text-xs mt-1">{erros.cep}</p>}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <label className="block text-sm text-gray-600">Rua / Quadra</label>
            <input type="text" name="rua" value={formulario.rua} onChange={lidarComMudanca} className={classeCampo('rua')} />
            {erros.rua && <p className="text-red-500 text-xs mt-1">{erros.rua}</p>}
          </div>
          <div>
            <label className="block text-sm text-gray-600">Número</label>
            <input type="text" name="numero" value={formulario.numero} onChange={lidarComMudanca} className={classeCampo('numero')} />
            {erros.numero && <p className="text-red-500 text-xs mt-1">{erros.numero}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600">Bairro</label>
            <input type="text" name="bairro" value={formulario.bairro} onChange={lidarComMudanca} className={classeCampo('bairro')} />
            {erros.bairro && <p className="text-red-500 text-xs mt-1">{erros.bairro}</p>}
          </div>
          <div>
            <label className="block text-sm text-gray-600">Cidade</label>
            <input type="text" name="cidade" value={formulario.cidade} onChange={lidarComMudanca} className={classeCampo('cidade')} />
            {erros.cidade && <p className="text-red-500 text-xs mt-1">{erros.cidade}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-600">Estado (UF)</label>
          <input type="text" name="estado" value={formulario.estado} onChange={lidarComMudanca} className={classeCampo('estado')} placeholder="Ex: DF" maxLength="2" />
          {erros.estado && <p className="text-red-500 text-xs mt-1">{erros.estado}</p>}
        </div>

        <button 
          type="submit" 
          disabled={carregando || buscandoCep}
          className={`w-full py-3 rounded text-white font-bold mt-4 transition ${carregando || buscandoCep ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
        >
          {carregando ? 'Processando...' : buscandoCep ? 'Buscando CEP...' : 'Ir para o Pagamento'}
        </button>
      </form>
    </div>
  );
}
