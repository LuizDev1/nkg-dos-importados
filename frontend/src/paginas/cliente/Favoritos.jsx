import { Link } from 'react-router-dom';
import CartaoProduto from '../../componentes/CartaoProduto';
import { useFavoritos } from '../../contextos/ContextoFavoritos';
import Botao from '../../componentes/ui/Botao';
import Superficie from '../../componentes/ui/Superficie';

export default function Favoritos() {
  const { produtos, estado, recarregar } = useFavoritos();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link to="/" className="botao-voltar mb-6 inline-flex">
        &larr; Voltar para a loja
      </Link>
      <p className="mb-2 text-sm font-semibold uppercase tracking-[0.28em] text-marca-clara">Sua seleção</p>
      <h1 className="mb-7 text-3xl font-bold">Favoritos</h1>

      <div role="status" className={estado === 'carregando' ? 'py-8 text-center text-texto-secundario' : 'sr-only'}>
        {estado === 'carregando' ? 'Carregando seus favoritos...' : ''}
      </div>

      {estado === 'erro' && (
        <div role="alert" className="rounded-cartao border border-erro-borda bg-erro-fundo p-6 text-center">
          <p className="mb-4 text-erro-texto">Não foi possível carregar seus favoritos. Verifique a conexão e tente de novo.</p>
          <Botao onClick={recarregar}>
            Tentar de novo
          </Botao>
        </div>
      )}

      {estado === 'pronto' && (produtos.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
          {produtos.map((produto) => <CartaoProduto key={produto.id} produto={produto} />)}
        </div>
      ) : (
        <Superficie espacamento="amplo" className="text-center">
          <p className="mb-4 text-texto-secundario">Você ainda não adicionou produtos aos favoritos.</p>
          <Botao variante="secundario" para="/">Explorar produtos</Botao>
        </Superficie>
      ))}
    </div>
  );
}
