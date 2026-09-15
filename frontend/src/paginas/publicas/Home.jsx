import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAutenticacao } from '../../contextos/ContextoAutenticacao';
import { listarCategorias, listarProdutos } from '../../servicos/produtoService';
import { buscarConfiguracoes } from '../../servicos/configuracaoService';
import CartaoProduto from '../../componentes/CartaoProduto';
import CarrosselBanners from '../../componentes/CarrosselBanners';
import { listarBanners } from '../../servicos/bannerService';

export default function Home() {
  const [produtos, setProdutos] = useState([]);
  const [configuracoes, setConfiguracoes] = useState({});
  const [banners, setBanners] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('');
  const [precoMinimo, setPrecoMinimo] = useState('');
  const [precoMaximo, setPrecoMaximo] = useState('');
  const [ordenacao, setOrdenacao] = useState('recentes');
  const [filtrosPendentes, setFiltrosPendentes] = useState({
    categoria: '',
    precoMinimo: '',
    precoMaximo: '',
    ordenacao: 'recentes',
  });
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const { usuario } = useAutenticacao();
  const navigate = useNavigate();

  useEffect(() => {
    if (usuario?.perfil === 'admin') navigate('/admin', { replace: true });
  }, [usuario, navigate]);

  useEffect(() => {
    async function carregar() {
      try {
        const [dadosConfiguracoes, dadosCategorias, dadosBanners] = await Promise.all([
          buscarConfiguracoes(),
          listarCategorias(),
          listarBanners(),
        ]);

        setConfiguracoes(dadosConfiguracoes);
        setCategorias(dadosCategorias);
        setBanners(dadosBanners);
      } catch (erro) {
        setErro(erro.message);
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, []);

  useEffect(() => {
    const temporizador = setTimeout(async () => {
      try {
        setErro('');
        const dados = await listarProdutos({
          busca,
          categoria,
          preco_min: precoMinimo,
          preco_max: precoMaximo,
          ordenacao,
        });
        setProdutos(dados);
      } catch (erro) {
        setErro(erro.message);
      } finally {
        setCarregando(false);
      }
    }, busca ? 350 : 0);

    return () => clearTimeout(temporizador);
  }, [busca, categoria, precoMinimo, precoMaximo, ordenacao]);

  if (carregando) {
    return <p className="text-center mt-10">Carregando produtos...</p>;
  }

  const pesquisaRealizada = busca.trim().length > 0;

  return (
    <div>
      {Boolean(configuracoes.aviso_ativo) && configuracoes.aviso_texto && (
        <div className="bg-black text-white text-center px-4 py-2">
          {configuracoes.aviso_texto}
        </div>
      )}

      <CarrosselBanners banners={banners} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Nossos produtos</h1>

        <form
          className="mb-6 flex"
          onSubmit={(evento) => {
            evento.preventDefault();
            setBusca(termoBusca.trim());
          }}
        >
          <div className="relative flex-1">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
              &#128269;
            </span>
            <input
              type="search"
              value={termoBusca}
              onChange={(evento) => {
                setTermoBusca(evento.target.value);
                if (!evento.target.value) setBusca('');
              }}
              placeholder="Buscar produtos"
              aria-label="Buscar produtos"
              className="w-full rounded-l-lg border border-r-0 border-gray-300 bg-white py-3 pl-11 pr-4 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <button
            type="submit"
            className="rounded-r-lg bg-blue-600 px-6 font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Buscar
          </button>
        </form>

        {erro && (
          <p role="alert" className="mb-6 rounded bg-red-50 p-3 text-red-700">
            {erro}
          </p>
        )}

        <div className={pesquisaRealizada ? 'grid items-start gap-6 lg:grid-cols-[240px_minmax(0,1fr)]' : ''}>
          {pesquisaRealizada && (
            <aside className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-5 text-lg font-bold">Filtros</h2>

              <label className="mb-2 block text-sm font-semibold" htmlFor="categoria">
                Categoria
              </label>
              <select
                id="categoria"
                value={filtrosPendentes.categoria}
                onChange={(evento) => setFiltrosPendentes((atuais) => ({
                  ...atuais,
                  categoria: evento.target.value,
                }))}
                className="mb-5 w-full rounded border border-gray-300 px-3 py-2"
              >
                <option value="">Todas as categorias</option>
                {categorias.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>

              <p className="mb-2 text-sm font-semibold">Faixa de preço</p>
              <div className="mb-5 grid grid-cols-2 gap-2">
              <input
                type="number"
                min="0"
                step="0.01"
                value={filtrosPendentes.precoMinimo}
                onChange={(evento) => setFiltrosPendentes((atuais) => ({
                  ...atuais,
                  precoMinimo: evento.target.value,
                }))}
                placeholder="Preço mínimo"
                aria-label="Preço mínimo"
                className="min-w-0 rounded border border-gray-300 px-3 py-2"
              />
              <input
                type="number"
                min="0"
                step="0.01"
                value={filtrosPendentes.precoMaximo}
                onChange={(evento) => setFiltrosPendentes((atuais) => ({
                  ...atuais,
                  precoMaximo: evento.target.value,
                }))}
                placeholder="Preço máximo"
                aria-label="Preço máximo"
                className="min-w-0 rounded border border-gray-300 px-3 py-2"
              />
              </div>

              <label className="mb-2 block text-sm font-semibold" htmlFor="ordenacao">
                Ordenar por
              </label>
              <select
                id="ordenacao"
                value={filtrosPendentes.ordenacao}
                onChange={(evento) => setFiltrosPendentes((atuais) => ({
                  ...atuais,
                  ordenacao: evento.target.value,
                }))}
                className="w-full rounded border border-gray-300 px-3 py-2"
              >
                <option value="recentes">Mais recentes</option>
                <option value="menor_preco">Menor preço</option>
                <option value="maior_preco">Maior preço</option>
                <option value="nome">Nome</option>
              </select>

              <button
                type="button"
                onClick={() => {
                  setCategoria(filtrosPendentes.categoria);
                  setPrecoMinimo(filtrosPendentes.precoMinimo);
                  setPrecoMaximo(filtrosPendentes.precoMaximo);
                  setOrdenacao(filtrosPendentes.ordenacao);
                }}
                className="mt-5 w-full rounded bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
              >
                Aplicar filtros
              </button>

              <button
                type="button"
                onClick={() => {
                  setFiltrosPendentes({
                    categoria: '',
                    precoMinimo: '',
                    precoMaximo: '',
                    ordenacao: 'recentes',
                  });
                  setCategoria('');
                  setPrecoMinimo('');
                  setPrecoMaximo('');
                  setOrdenacao('recentes');
                }}
                className="mt-5 w-full text-sm text-blue-600 hover:underline"
              >
                Limpar filtros
              </button>
            </aside>
          )}

          <main>
            {pesquisaRealizada && (
              <p className="mb-4 text-gray-600">
                Resultado da pesquisa para <strong>&quot;{busca}&quot;</strong>
              </p>
            )}

            {!erro && produtos.length === 0 ? (
              <div className="rounded-lg bg-white p-8 text-center shadow">
                <p className="text-gray-500">Nenhum produto encontrado.</p>
              </div>
            ) : (
              <div className={`grid grid-cols-2 gap-6 sm:grid-cols-3 ${pesquisaRealizada ? 'xl:grid-cols-3' : 'lg:grid-cols-4'}`}>
                {produtos.map((produto) => (
                  <CartaoProduto key={produto.id} produto={produto} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
