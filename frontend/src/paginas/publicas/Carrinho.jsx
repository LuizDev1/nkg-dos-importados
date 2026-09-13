import { Link, useNavigate } from 'react-router-dom';
import { useCarrinho } from '../../contextos/ContextoCarrinho';

export default function Carrinho() {
  const { itens, removerItem, alterarQuantidade, total } = useCarrinho();
  const navigate = useNavigate();

  function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  if (itens.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">Seu carrinho está vazio.</p>
        <Link to="/" className="text-blue-600 hover:underline">
          Voltar para a loja
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Meu carrinho</h1>
      <div className="space-y-4">
        {itens.map((item) => (
          <div
            key={item.produto_id}
            className="flex items-center gap-4 bg-white p-4 rounded-lg shadow"
          >
            <img
              src={item.foto_url || 'https://placehold.co/80'}
              alt={item.nome}
              className="w-16 h-16 object-cover rounded"
            />
            <div className="flex-1">
              <p className="font-semibold">{item.nome}</p>
              <p className="text-sm text-gray-500">{formatarMoeda(item.preco)}</p>
            </div>
            <input
              type="number"
              min="1"
              value={item.quantidade}
              onChange={(e) => alterarQuantidade(item.produto_id, Number(e.target.value))}
              className="w-16 border rounded px-2 py-1 text-center"
            />
            <button
              onClick={() => removerItem(item.produto_id)}
              className="text-red-600 hover:underline text-sm"
            >
              Remover
            </button>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-between items-center border-t pt-4">
        <span className="text-lg font-bold">Total: {formatarMoeda(total)}</span>
        <button 
          onClick={() => navigate('/checkout')}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Finalizar compra
        </button>
      </div>
    </div>
  );
}