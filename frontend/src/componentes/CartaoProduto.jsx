import { Link, useNavigate } from 'react-router-dom';
import { useAutenticacao } from '../contextos/ContextoAutenticacao';
import { useFavoritos } from '../contextos/ContextoFavoritos';
import BotaoIcone from './ui/BotaoIcone';
import Preco from './ui/Preco';

// Card interativo de produto: o link cobre a área de conteúdo e tem o nome do produto como texto;
// o favorito é um botão separado, com nome acessível próprio.
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
    <article className="group relative flex flex-col overflow-hidden rounded-cartao border border-divisor bg-superficie transition duration-300 hover:-translate-y-1 hover:border-marca-ativo hover:shadow-nivel-3">
      {usuario?.perfil !== 'admin' && (
        <BotaoIcone
          rotulo={favorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          variante={favorito ? 'marca' : 'neutro'}
          onClick={favoritar}
          className="absolute right-3 top-3 z-10 backdrop-blur"
        >
          {favorito ? '♥' : '♡'}
        </BotaoIcone>
      )}
      <Link to={`/produto/${produto.id}`} className="flex flex-1 flex-col">
        <div className="overflow-hidden bg-superficie-elevada">
          {produto.foto_url ? (
            <img src={produto.foto_url} alt={produto.nome} className="h-52 w-full object-cover transition duration-500 group-hover:scale-105" />
          ) : (
            <div role="img" aria-label={`Imagem indisponível de ${produto.nome}`} className="flex h-52 w-full items-center justify-center bg-superficie-destaque text-legenda uppercase tracking-rotulo text-texto-secundario">Sem imagem</div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-4">
          <p className="mb-2 text-legenda uppercase tracking-rotulo text-marca-ativo">{produto.categoria}</p>
          <h2 className="mb-4 font-semibold text-texto transition group-hover:text-marca">{produto.nome}</h2>
          {Number(produto.avaliacoes_total) > 0 && (
            <p className="mb-3 text-xs text-texto-secundario">
              <span className="text-marca">★ {Number(produto.avaliacao_media).toFixed(1)}</span>
              {' '}({produto.avaliacoes_total})
            </p>
          )}
          <Preco valor={produto.preco} tamanho="padrao" as="p" className="mt-auto text-marca" />
        </div>
      </Link>
    </article>
  );
}
