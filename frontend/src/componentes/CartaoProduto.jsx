import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCarrinho } from '../contextos/ContextoCarrinho';
import { useAutenticacao } from '../contextos/ContextoAutenticacao';

export default function CartaoProduto({ produto }) {
  const [adicionado, setAdicionado] = useState(false);
  const { adicionarItem } = useCarrinho();
  const { usuario } = useAutenticacao();

  function aoAdicionar() {
    adicionarItem(produto);
    setAdicionado(true);
    setTimeout(() => setAdicionado(false), 1200);
  }

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition p-4 flex flex-col">
      <Link to={`/produto/${produto.id}`}>
        <img
          src={produto.foto_url || 'https://placehold.co/200'}
          alt={produto.nome}
          className="w-full h-40 object-cover rounded mb-3"
        />
        <h2 className="font-semibold hover:text-blue-600">{produto.nome}</h2>
      </Link>
      <p className="text-sm text-gray-500 mb-2">{produto.categoria}</p>
      <p className="text-lg font-bold mb-3">
        {Number(produto.preco).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        })}
      </p>
      {usuario?.perfil !== 'admin' && (
        <button
          onClick={aoAdicionar}
          className={`mt-auto py-2 rounded transition ${
            adicionado ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {adicionado ? 'Adicionado!' : 'Adicionar ao carrinho'}
        </button>
      )}
    </div>
  );
}
