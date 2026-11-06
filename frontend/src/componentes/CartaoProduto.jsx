import { Link, useNavigate } from 'react-router-dom';
import { useAutenticacao } from '../contextos/ContextoAutenticacao';
import { useFavoritos } from '../contextos/ContextoFavoritos';
import BotaoIcone from './ui/BotaoIcone';
import Preco from './ui/Preco';
import { IconeAlerta, IconeCaixa, IconeCoracao, IconeEstrela, SemImagem } from './IconesProduto';
import { estoqueDoCartao, formatarNota, textoNota } from '../servicos/produtoVisual.mjs';

// Card de produto sem contorno externo. O link do produto fica só no nome e se estende sobre o card
// (pseudo-elemento), então o nome acessível do link é o nome do produto; o favorito é um botão à parte,
// acima do link, sem controles aninhados.
export default function CartaoProduto({ produto }) {
  const { usuario } = useAutenticacao();
  const { estaFavorito, alternarFavorito } = useFavoritos();
  const navigate = useNavigate();
  const favorito = estaFavorito(produto.id);
  const estoque = estoqueDoCartao(produto);
  const temAvaliacoes = Number(produto.avaliacoes_total) > 0;

  async function favoritar() {
    if (!usuario) {
      navigate('/login');
      return;
    }
    await alternarFavorito(produto);
  }

  return (
    <article className="group relative flex min-w-0 flex-col">
      <div className="aspect-[4/5] overflow-hidden rounded-cartao bg-superficie-elevada">
        {produto.foto_url
          ? <img src={produto.foto_url} alt="" loading="lazy" className="h-full w-full object-contain p-3" />
          : <SemImagem nome={produto.nome} />}
      </div>

      <div className="flex flex-1 flex-col pt-3">
        <div className="flex min-h-5 items-center justify-between gap-3 text-legenda text-texto-secundario">
          <span className="min-w-0 truncate">{produto.categoria}</span>
          {temAvaliacoes && (
            <span className="inline-flex shrink-0 items-center gap-1 tabular-nums">
              <IconeEstrela tamanho={12} className="text-marca" />
              <span aria-hidden="true">{formatarNota(produto.avaliacao_media)} ({produto.avaliacoes_total})</span>
              <span className="sr-only">{textoNota(produto.avaliacao_media, Number(produto.avaliacoes_total))}</span>
            </span>
          )}
        </div>
        <h2 className="mt-1.5 text-corpo font-semibold leading-snug text-texto">
          <Link to={`/produto/${produto.id}`} className="rounded-controle after:absolute after:inset-0 after:rounded-cartao after:content-[''] group-hover:underline group-hover:underline-offset-4">
            {produto.nome}
          </Link>
        </h2>
        {/* Estoque logo abaixo do nome: o preço fica sempre na base e alinhado entre os cards da fileira. */}
        {estoque === 'sem' && (
          <p className="mt-1 inline-flex items-center gap-1.5 text-legenda text-aviso-texto"><IconeAlerta tamanho={14} />Sem estoque</p>
        )}
        {estoque === 'baixo' && (
          <p className="mt-1 inline-flex items-center gap-1.5 text-legenda text-texto-secundario"><IconeCaixa tamanho={14} />Últimas unidades</p>
        )}
        <Preco valor={produto.preco} tamanho="padrao" as="p" className="mt-auto pt-2 text-texto" />
      </div>

      {usuario?.perfil !== 'admin' && (
        <BotaoIcone
          tamanho="sm"
          rotulo={favorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          variante={favorito ? 'marca' : 'neutro'}
          onClick={favoritar}
          className="absolute right-2.5 top-2.5 z-10"
        >
          <IconeCoracao tamanho={16} cheio={favorito} />
        </BotaoIcone>
      )}
    </article>
  );
}
