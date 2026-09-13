import { useEffect, useState } from 'react';
import { listarProdutos } from '../../servicos/produtoService';
import { buscarConfiguracoes } from '../../servicos/configuracaoService';
import CartaoProduto from '../../componentes/CartaoProduto';

export default function Home() {
  const [produtos, setProdutos] = useState([]);
  const [configuracoes, setConfiguracoes] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    async function carregar() {
      try {
        const [dadosProdutos, dadosConfiguracoes] = await Promise.all([
          listarProdutos(),
          buscarConfiguracoes(),
        ]);

        setProdutos(dadosProdutos);
        setConfiguracoes(dadosConfiguracoes);
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

  const banner = configuracoes.banner_url && (
    <img
      src={configuracoes.banner_url}
      alt={configuracoes.banner_titulo || 'Banner da loja'}
      className="w-full max-h-96 object-cover"
    />
  );

  return (
    <div>
      {configuracoes.aviso_ativo && configuracoes.aviso_texto && (
        <div className="bg-black text-white text-center px-4 py-2">
          {configuracoes.aviso_texto}
        </div>
      )}

      {configuracoes.banner_link ? (
        <a
          href={configuracoes.banner_link}
          target={configuracoes.banner_link.startsWith('http') ? '_blank' : undefined}
          rel={configuracoes.banner_link.startsWith('http') ? 'noreferrer' : undefined}
        >
          {banner}
        </a>
      ) : (
        banner
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Nossos produtos</h1>

        {produtos.length === 0 ? (
          <p className="text-gray-500">
            Nenhum produto disponível no momento.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {produtos.map((produto) => (
              <CartaoProduto key={produto.id} produto={produto} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}