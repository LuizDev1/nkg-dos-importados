import { useEffect, useState } from 'react';
import { listarProdutos } from '../../servicos/produtoService';
import CartaoProduto from '../../componentes/CartaoProduto';

export default function Home() {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

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
            <CartaoProduto key={produto.id} produto={produto} />
          ))}
        </div>
      )}
    </div>
  );
}
