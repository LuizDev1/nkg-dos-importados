import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCarrinho } from '../../contextos/ContextoCarrinho';
import { criarPedido } from '../../servicos/pedidoService';

export default function Checkout() {
  const { itens, total } = useCarrinho();
  const navigate = useNavigate();
  
  const [formulario, setFormulario] = useState({
    cep: '', rua: '', numero: '', bairro: '', cidade: '', estado: '', telefone: ''
  });
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

    useEffect(() => {
        if (itens.length === 0) {
        navigate('/');
        }
    }, [itens.length, navigate]);

    if (itens.length === 0) return null;

  function lidarComMudanca(e) {
    const { name, value } = e.target;
    setFormulario(atual => ({ ...atual, [name]: value }));
  }

  async function finalizarCompra(e) {
    e.preventDefault();
    setCarregando(true);
    setErro('');

    try {
      const usuarioStr = localStorage.getItem('usuario');
      const usuarioId = usuarioStr ? JSON.parse(usuarioStr).id : 1; 

      const enderecoCompleto = `${formulario.rua}, ${formulario.numero} - ${formulario.bairro}, ${formulario.cidade} - ${formulario.estado}, CEP: ${formulario.cep}`;

      const payload = {
        usuario_id: usuarioId,
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

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Finalizar Compra</h1>
      
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
            <input required type="text" name="telefone" value={formulario.telefone} onChange={lidarComMudanca} className="w-full border rounded px-3 py-2" placeholder="(61) 90000-0000" />
          </div>
          <div>
            <label className="block text-sm text-gray-600">CEP</label>
            <input required type="text" name="cep" value={formulario.cep} onChange={lidarComMudanca} className="w-full border rounded px-3 py-2" placeholder="00000-000" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <label className="block text-sm text-gray-600">Rua / Quadra</label>
            <input required type="text" name="rua" value={formulario.rua} onChange={lidarComMudanca} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Número</label>
            <input required type="text" name="numero" value={formulario.numero} onChange={lidarComMudanca} className="w-full border rounded px-3 py-2" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600">Bairro</label>
            <input required type="text" name="bairro" value={formulario.bairro} onChange={lidarComMudanca} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Cidade</label>
            <input required type="text" name="cidade" value={formulario.cidade} onChange={lidarComMudanca} className="w-full border rounded px-3 py-2" />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-600">Estado (UF)</label>
          <input required type="text" name="estado" value={formulario.estado} onChange={lidarComMudanca} className="w-full border rounded px-3 py-2" placeholder="Ex: DF" maxLength="2" />
        </div>

        <button 
          type="submit" 
          disabled={carregando}
          className={`w-full py-3 rounded text-white font-bold mt-4 transition ${carregando ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
        >
          {carregando ? 'Processando...' : 'Ir para o Pagamento'}
        </button>
      </form>
    </div>
  );
}