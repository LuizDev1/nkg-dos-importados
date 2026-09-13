import { Link, useNavigate } from 'react-router-dom';
import { useCarrinho } from '../../contextos/ContextoCarrinho';
import { useAutenticacao } from '../../contextos/ContextoAutenticacao';
import ItemCarrinho from '../../componentes/ItemCarrinho';

export default function Carrinho() {
  const { itens, removerItem, alterarQuantidade, total } = useCarrinho();
  const { usuario } = useAutenticacao();
  const navigate = useNavigate();

  function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function handleFinalizarCompra() {
    if (!usuario) {
      // Envia o usuário para o login com a instrução de voltar para o checkout
      navigate('/login', { state: { from: '/checkout' } });
    } else {
      navigate('/checkout');
    }
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
          <ItemCarrinho
            key={item.produto_id}
            item={item}
            onAlterarQuantidade={alterarQuantidade}
            onRemover={removerItem}
          />
        ))}
      </div>
      <div className="mt-6 flex justify-between items-center border-t pt-4">
        <span className="text-lg font-bold">Total: {formatarMoeda(total)}</span>
        <button
          onClick={handleFinalizarCompra}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Finalizar compra
        </button>
      </div>
    </div>
  );
}