import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { buscarProduto } from '../../servicos/produtoService';
import { useCarrinho } from '../../contextos/ContextoCarrinho';

export default function DetalheProduto() {
  const { id } = useParams();
  const [produto, setProduto] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [adicionado, setAdicionado] = useState(false);

  const { adicionarItem, alterarQuantidade } = useCarrinho();

  useEffect(() => {
    async function carregar() {
      try {
        const dados = await buscarProduto(id);
        setProduto(dados);
      } catch (erro) {
        setErro(erro.message);
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, [id]);

  function aoAdicionar() {
    adicionarItem(produto);
    if (quantidade > 1) {
      alterarQuantidade(produto.id, quantidade);
    }
    setAdicionado(true);
    setTimeout(() => setAdicionado(false), 1200);
  }

  if (carregando) return <p className="text-center mt-10">Carregando produto...</p>;
  if (erro) return <p className="text-center mt-10 text-red-600">{erro}</p>;
  if (!produto) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/" className="text-blue-600 hover:underline text-sm">
        &larr; Voltar para a loja
      </Link>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-8">
        <img
          src={produto.foto_url || 'https://placehold.co/400'}
          alt={produto.nome}
          className="w-full h-80 object-cover rounded-lg"
        />

        <div>
          <h1 className="text-2xl font-bold mb-2">{produto.nome}</h1>
          <p className="text-sm text-gray-500 mb-4">{produto.categoria}</p>
          <p className="text-2xl font-bold mb-4">
            {Number(produto.preco).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </p>

          {produto.estoque_qtd > 0 ? (
            <p className="text-sm text-green-600 mb-4">
              Em estoque ({produto.estoque_qtd} disponíveis)
            </p>
          ) : (
            <p className="text-sm text-red-600 mb-4">Fora de estoque</p>
          )}

          <div className="flex items-center gap-3 mb-4">
            <label className="text-sm font-medium">Quantidade:</label>
            <input
              type="number"
              min="1"
              max={produto.estoque_qtd}
              value={quantidade}
              onChange={(e) => setQuantidade(Number(e.target.value))}
              className="w-20 border rounded px-2 py-1 text-center"
            />
          </div>

          <button
            onClick={aoAdicionar}
            disabled={produto.estoque_qtd === 0}
            className={`w-full py-3 rounded transition ${
              adicionado
                ? 'bg-green-600 text-white'
                : produto.estoque_qtd === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {adicionado ? 'Adicionado!' : 'Adicionar ao carrinho'}
          </button>
        </div>
      </div>
    </div>
  );
}