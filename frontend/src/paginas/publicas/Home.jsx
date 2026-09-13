import { useEffect, useState } from 'react';
import { listarProdutos } from '../../servicos/produtoService';
import { useCarrinho } from '../../contextos/ContextoCarrinho';

export default function Home() {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [adicionadoId, setAdicionadoId] = useState(null);

  const { adicionarItem } = useCarrinho();

  useEffect(() => {
    async function carregar() {
      try {
        const dados = await listarProdutos();
        setProdutos(dados);
      } catch (erro) {
        setErro(erro.message);
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, []);

  function aoAdicionar(produto) {
    adicionarItem(produto);
    setAdicionadoId(produto.id);
    setTimeout(() => setAdicionadoId(null), 1200);
  }

  if (carregando) {
    return <p className="text-center mt-10">Carregando produtos...</p>;
  }

  if (erro) {
    return <p className="text-center mt-10 text-red-600">{erro}</p>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Nossos produtos</h1>

      {produtos.length === 0 ? (
        <p className="text-gray-500">Nenhum produto disponível no momento.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {produtos.map((produto) => (
            <div
              key={produto.id}
              className="bg-white rounded-lg shadow hover:shadow-md transition p-4 flex flex-col"
            >
              <img
                src={produto.foto_url || 'https://placehold.co/200'}
                alt={produto.nome}
                className="w-full h-40 object-cover rounded mb-3"
              />
              <h2 className="font-semibold">{produto.nome}</h2>
              <p className="text-sm text-gray-500 mb-2">{produto.categoria}</p>
              <p className="text-lg font-bold mb-3">
                {Number(produto.preco).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </p>
              <button
                onClick={() => aoAdicionar(produto)}
                className={`mt-auto py-2 rounded transition ${
                  adicionadoId === produto.id
                    ? 'bg-green-600 text-white'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {adicionadoId === produto.id ? 'Adicionado!' : 'Adicionar ao carrinho'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}