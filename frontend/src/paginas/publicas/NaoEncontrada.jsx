import { Link, useLocation } from 'react-router-dom';
import { useAutenticacao } from '../../contextos/ContextoAutenticacao';

export default function NaoEncontrada() {
  const { pathname } = useLocation();
  const { usuario } = useAutenticacao();
  const admin = usuario?.perfil === 'admin';

  return (
    <section className="mx-auto max-w-xl px-4 py-16 text-center" aria-labelledby="titulo-nao-encontrada">
      <h1 id="titulo-nao-encontrada" className="text-3xl font-bold">Página não encontrada</h1>
      <p className="mt-3 text-texto-secundario">
        O endereço <span className="break-all font-mono text-sm text-[#f4efe5]">{pathname}</span> não existe ou foi removido.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to={admin ? '/admin' : '/'} className="rounded bg-acao px-5 py-3 font-semibold text-acao-texto hover:bg-acao-hover">
          {admin ? 'Ir para o painel' : 'Ir para a loja'}
        </Link>
        {!admin && (
          <Link to="/minha-conta/pedidos" className="rounded border border-borda-campo px-5 py-3 font-semibold text-link hover:border-link">
            Ver meus pedidos
          </Link>
        )}
      </div>
    </section>
  );
}
