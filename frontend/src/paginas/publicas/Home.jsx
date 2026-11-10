import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAutenticacao } from '../../contextos/ContextoAutenticacao';
import { listarCategorias, listarProdutos } from '../../servicos/produtoService';
import { buscarConfiguracoes } from '../../servicos/configuracaoService';
import CartaoProduto from '../../componentes/CartaoProduto';
import CarrosselBanners from '../../componentes/CarrosselBanners';
import { listarBanners } from '../../servicos/bannerService';
import Botao from '../../componentes/ui/Botao';
import Campo from '../../componentes/ui/Campo';
import Superficie from '../../componentes/ui/Superficie';
import { classesCampo } from '../../componentes/ui/estilos.mjs';

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
    <div className="min-h-full bg-transparent">
      {Number(configuracoes.aviso_ativo) === 1 && Boolean(configuracoes.aviso_texto) && (
        <div className="bg-transparent px-4 py-2 text-center text-xs uppercase tracking-[0.12em] text-marca-texto">
          {configuracoes.aviso_texto}
        </div>
      )}

      <CarrosselBanners banners={banners} />

      <div className="mx-auto w-full max-w-[1760px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-7">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.28em] text-marca-texto">Catálogo</p>
          <h1 className="text-3xl font-bold text-texto">Nossos produtos</h1>
        </div>

        <form
          className="mb-8 flex shadow-[0_14px_35px_rgba(0,0,0,0.28)]"
          onSubmit={(evento) => {
            evento.preventDefault();
            setBusca(termoBusca.trim());
          }}
        >
          <div className="relative flex-1">
            {/* Lupa decorativa: o campo já se chama "Buscar produtos". */}
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                <circle cx="11" cy="11" r="6.5" />
                <path d="M16 16l4.5 4.5" />
              </svg>
            </span>
            <input
              type="search"
              name="busca"
              autoComplete="off"
              value={termoBusca}
              onChange={(evento) => {
                setTermoBusca(evento.target.value);
                if (!evento.target.value) setBusca('');
              }}
              placeholder="Buscar produtos"
              aria-label="Buscar produtos"
              className="w-full rounded-l border border-r-0 border-borda-forte bg-superficie py-3.5 pl-11 pr-4 outline-none transition"
            />
          </div>
          <button
            type="submit"
            className="rounded-r bg-marca px-7 text-xs font-bold uppercase tracking-[0.12em] text-texto-inverso transition hover:bg-marca-hover"
          >
            Buscar
          </button>
        </form>

        {erro && (
          <p role="alert" className="mb-6 rounded border border-erro-borda bg-erro-fundo p-3 text-erro">
            {erro}
          </p>
        )}

        <div className={pesquisaRealizada ? 'grid items-start gap-6 lg:grid-cols-[240px_minmax(0,1fr)]' : ''}>
          {pesquisaRealizada && (
            <Superficie as="aside" sombra aria-labelledby="titulo-filtros">
              <h2 id="titulo-filtros" className="mb-5 border-b border-divisor pb-3 text-sm font-bold uppercase tracking-rotulo text-marca-texto">Filtros</h2>

              <Campo
                as="select"
                rotulo="Categoria"
                className="mb-5"
                id="categoria"
                name="categoria"
                value={filtrosPendentes.categoria}
                onChange={(evento) => setFiltrosPendentes((atuais) => ({
                  ...atuais,
                  categoria: evento.target.value,
                }))}
              >
                <option value="">Todas as categorias</option>
                {categorias.map((item) => <option key={item} value={item}>{item}</option>)}
              </Campo>

              <p id="faixa-preco" className="mb-1.5 text-rotulo text-texto">Faixa de preço (R$)</p>
              <div className="mb-5 grid grid-cols-2 gap-2" role="group" aria-labelledby="faixa-preco">
              <input
                type="number"
                min="0"
                step="0.01"
                value={filtrosPendentes.precoMinimo}
                onChange={(evento) => setFiltrosPendentes((atuais) => ({
                  ...atuais,
                  precoMinimo: evento.target.value,
                }))}
                name="preco_min"
                inputMode="decimal"
                placeholder="Mínimo"
                aria-label="Preço mínimo"
                className={`min-w-0 ${classesCampo()}`}
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
                name="preco_max"
                inputMode="decimal"
                placeholder="Máximo"
                aria-label="Preço máximo"
                className={`min-w-0 ${classesCampo()}`}
              />
              </div>

              <Campo
                as="select"
                rotulo="Ordenar por"
                id="ordenacao"
                name="ordenacao"
                value={filtrosPendentes.ordenacao}
                onChange={(evento) => setFiltrosPendentes((atuais) => ({
                  ...atuais,
                  ordenacao: evento.target.value,
                }))}
              >
                <option value="recentes">Mais recentes</option>
                <option value="melhor_avaliados">Melhor avaliados</option>
                <option value="menor_preco">Menor preço</option>
                <option value="maior_preco">Maior preço</option>
                <option value="nome">Nome</option>
              </Campo>

              <Botao
                larguraTotal
                className="mt-5"
                onClick={() => {
                  setCategoria(filtrosPendentes.categoria);
                  setPrecoMinimo(filtrosPendentes.precoMinimo);
                  setPrecoMaximo(filtrosPendentes.precoMaximo);
                  setOrdenacao(filtrosPendentes.ordenacao);
                }}
              >
                Aplicar filtros
              </Botao>

              <Botao
                variante="discreto"
                larguraTotal
                className="mt-2"
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
              >
                Limpar filtros
              </Botao>
            </Superficie>
          )}

          <section aria-label="Produtos">
            {pesquisaRealizada && (
              <p className="mb-4 text-texto-secundario">
                Resultado da pesquisa para <strong>&quot;{busca}&quot;</strong>
              </p>
            )}

            {!erro && produtos.length === 0 ? (
              <Superficie sombra espacamento="amplo" className="text-center">
                <p className="text-texto-secundario">Nenhum produto encontrado.</p>
              </Superficie>
            ) : (
              <div className={`grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-6 ${pesquisaRealizada ? 'xl:grid-cols-3' : 'lg:grid-cols-4'}`}>
                {produtos.map((produto) => (
                  <CartaoProduto key={produto.id} produto={produto} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
