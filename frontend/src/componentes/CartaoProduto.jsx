import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Star, Eye } from 'lucide-react';
import { useAutenticacao } from '../contextos/ContextoAutenticacao';
import { useFavoritos } from '../contextos/ContextoFavoritos';

export default function CartaoProduto({ produto }) {
  const { usuario } = useAutenticacao();
  const { estaFavorito, alternarFavorito } = useFavoritos();
  const navigate = useNavigate();
  const favorito = estaFavorito(produto.id);
  const [animando, setAnimando] = useState(false);

  async function favoritar(evento) {
    evento.preventDefault();
    evento.stopPropagation();

    if (!usuario) {
      navigate('/login');
      return;
    }

    setAnimando(true);
    await alternarFavorito(produto);
    setTimeout(() => setAnimando(false), 450);
  }

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-sm border border-[#2b2618] bg-[#111210] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-[#c9a43b] hover:shadow-[0_20px_45px_rgba(0,0,0,0.6)]">
      {usuario?.perfil !== 'admin' && (
        <button
          type="button"
          onClick={favoritar}
          aria-label={favorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          className={`absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-200 active:scale-90 ${
            animando ? 'anim-heart-pop' : ''
          } ${
            favorito
              ? 'border-[#d4af45] bg-[#d4af45] text-[#090a09] shadow-[0_4px_12px_rgba(212,175,69,0.35)]'
              : 'border-white/15 bg-black/60 text-white hover:scale-110 hover:border-[#d4af45] hover:text-[#d4af45]'
          }`}
        >
          <Heart
            className={`h-4 w-4 transition-transform duration-200 ${
              favorito ? 'fill-current' : ''
            }`}
          />
        </button>
      )}

      <Link to={`/produto/${produto.id}`} className="flex flex-1 flex-col">
        <div className="relative overflow-hidden bg-[#171714]">
          {produto.foto_url ? (
            <img
              src={produto.foto_url}
              alt={produto.nome}
              className="h-56 w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
            />
          ) : (
            <div
              role="img"
              aria-label={`Imagem indisponível de ${produto.nome}`}
              className="flex h-56 w-full items-center justify-center bg-[#24251f] text-xs uppercase tracking-[0.18em] text-[#aaa396]"
            >
              Sem imagem
            </div>
          )}

          {/* Overlay deslizante ao passar o cursor */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3 opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 translate-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d4af45]/40 bg-[#111210]/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#d4af45] shadow-lg backdrop-blur-sm">
              <Eye className="h-3.5 w-3.5" />
              Ver Detalhes
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-4">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9b823c]">
            {produto.categoria}
          </p>

          <h2 className="mb-3 line-clamp-2 text-sm font-semibold text-[#f4efe5] transition-colors duration-200 group-hover:text-[#d4af45]">
            {produto.nome}
          </h2>

          {Number(produto.avaliacoes_total) > 0 && (
            <div className="mb-3 flex items-center gap-1.5 text-xs text-[#aaa399]">
              <span className="inline-flex items-center gap-1 text-[#d4af45] font-medium">
                <Star className="h-3.5 w-3.5 fill-[#d4af45] text-[#d4af45]" />
                {Number(produto.avaliacao_media).toFixed(1)}
              </span>
              <span>({produto.avaliacoes_total})</span>
            </div>
          )}

          <p className="mt-auto text-lg font-bold text-[#d4af45]">
            {Number(produto.preco).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </p>
        </div>
      </Link>
    </article>
  );
}
