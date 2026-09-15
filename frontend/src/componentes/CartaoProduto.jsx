import { Link, useNavigate } from 'react-router-dom';
import { useAutenticacao } from '../contextos/ContextoAutenticacao';
import { useFavoritos } from '../contextos/ContextoFavoritos';

export default function CartaoProduto({ produto }) {
  const { usuario } = useAutenticacao();
  const { estaFavorito, alternarFavorito } = useFavoritos();
  const navigate = useNavigate();
  const favorito = estaFavorito(produto.id);

  async function favoritar() {
    if (!usuario) {
      navigate('/login');
      return;
    }
    await alternarFavorito(produto);
  }

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-sm border border-[#2b2618] bg-[#111210] transition duration-300 hover:-translate-y-1 hover:border-[#c9a43b] hover:shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
      {usuario?.perfil !== 'admin' && <button
        type="button"
        onClick={favoritar}
        aria-label={favorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        className={`absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur ${favorito ? 'border-[#d4af45] bg-[#d4af45] text-[#090a09]' : 'border-white/15 bg-black/60 text-white hover:border-[#d4af45] hover:text-[#d4af45]'}`}
      >
        {favorito ? '♥' : '♡'}
      </button>}
      <Link to={`/produto/${produto.id}`} className="flex flex-1 flex-col">
      <div className="overflow-hidden bg-[#171714]">
        {produto.foto_url ? (
          <img src={produto.foto_url} alt={produto.nome} className="h-52 w-full object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div role="img" aria-label={`Imagem indisponível de ${produto.nome}`} className="flex h-52 w-full items-center justify-center bg-[#24251f] text-xs uppercase tracking-[0.18em] text-[#aaa396]">Sem imagem</div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-[#9b823c]">{produto.categoria}</p>
        <h2 className="mb-4 font-semibold text-[#f4efe5] transition group-hover:text-[#d4af45]">{produto.nome}</h2>
        {Number(produto.avaliacoes_total) > 0 && (
          <p className="mb-3 text-xs text-[#aaa399]">
            <span className="text-[#d4af45]">★ {Number(produto.avaliacao_media).toFixed(1)}</span>
            {' '}({produto.avaliacoes_total})
          </p>
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
