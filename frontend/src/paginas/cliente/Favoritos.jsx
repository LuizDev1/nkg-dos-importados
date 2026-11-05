import { Link } from 'react-router-dom';
import CartaoProduto from '../../componentes/CartaoProduto';
import { useFavoritos } from '../../contextos/ContextoFavoritos';

export default function Favoritos() {
  const { produtos, estado, recarregar } = useFavoritos();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link to="/" className="botao-voltar mb-6 inline-flex">
        &larr; Voltar para a loja
      </Link>
      <p className="mb-2 text-sm font-semibold uppercase tracking-[0.28em] text-[#b99a42]">Sua seleção</p>
      <h1 className="mb-7 text-3xl font-bold">Favoritos</h1>

      <div role="status" className={estado === 'carregando' ? 'py-8 text-center text-texto-secundario' : 'sr-only'}>
        {estado === 'carregando' ? 'Carregando seus favoritos...' : ''}
      </div>

      {estado === 'erro' && (
        <div role="alert" className="rounded border border-erro-borda bg-erro-fundo p-6 text-center">
          <p className="mb-4 text-[#fca5a5]">Não foi possível carregar seus favoritos. Verifique a conexão e tente de novo.</p>
          <button type="button" onClick={recarregar} className="rounded bg-acao px-4 py-2 font-semibold text-acao-texto hover:bg-acao-hover">
            Tentar de novo
          </button>
        </div>
      )}

      {estado === 'pronto' && (produtos.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
          {produtos.map((produto) => <CartaoProduto key={produto.id} produto={produto} />)}
        </div>
      ) : (
        <div className="rounded border border-white/[0.05] bg-white p-8 text-center">
          <p className="mb-4 text-gray-500">Você ainda não adicionou produtos aos favoritos.</p>
          <Link to="/" className="text-link underline underline-offset-2">Explorar produtos</Link>
        </div>
      ))}
    </div>
  );
}
