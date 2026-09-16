import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCarrinho } from '../contextos/ContextoCarrinho';
import { useAutenticacao } from '../contextos/ContextoAutenticacao';

function IconeMenu({ tipo }) {
  const desenhos = {
    carrinho: <><path d="M3 3h2l3 12h10l3-9H6" /><circle cx="9" cy="20" r="1" /><circle cx="18" cy="20" r="1" /></>,
    favoritos: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />,
    pedidos: <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V3h6v1M9 9h6M9 13h6M9 17h4" /></>,
    conta: <><circle cx="12" cy="8" r="4" /><path d="M4 21v-2a8 8 0 0 1 16 0v2" /></>,
  };

  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true" focusable="false">
      {desenhos[tipo]}
    </svg>
  );
}

export default function Cabecalho() {
  const { quantidadeTotal } = useCarrinho();
  const { usuario, logout } = useAutenticacao();
  const location = useLocation();
  const navigate = useNavigate();

  function sair() {
    logout();
    navigate('/', { replace: true });
  }
  const isAdmin = usuario?.perfil === 'admin';
  const nomeExibido = isAdmin
  ? usuario?.nome
  : (usuario?.nome || '').trim().split(/\s+/).slice(0, 2).join(' ');
  const ocultarCarrinho = ['/login', '/cadastro'].includes(location.pathname);

  return (
    <header className="sticky top-0 z-50 bg-[#090a09]/95 shadow-[0_8px_28px_rgba(0,0,0,0.16)] backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1760px] flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link to={isAdmin ? '/admin' : '/'} className="text-xl font-black uppercase tracking-[0.12em] text-[#d4af45]">
          NKG <span>dos Importados</span>
        </Link>

        <nav className="flex flex-wrap items-center gap-5 text-xs uppercase tracking-[0.08em]">
          
          {!isAdmin && !ocultarCarrinho && (
            <Link to="/carrinho" aria-label="Carrinho"
              className="nav-icone relative inline-flex items-center justify-center text-[#d4af45]">
              <IconeMenu tipo="carrinho" />
              {quantidadeTotal > 0 && (
                <span className="absolute -top-1 -right-1 flex min-w-4 h-4 items-center justify-center rounded-full bg-[#d4af45] px-1 text-[10px] text-[#090a09]">
                  {quantidadeTotal}
                </span>
              )}
            </Link>
          )}
          {/* Autenticação */}
          {usuario ? (
            <>
              {!isAdmin && (
                <>
                  <Link to="/favoritos" aria-label="Favoritos"
                    className="nav-icone inline-flex items-center justify-center text-[#d4af45]">
                    <IconeMenu tipo="favoritos" />
                  </Link>
                  <Link to="/minha-conta/pedidos" aria-label="Meus pedidos"
                    className="nav-icone inline-flex items-center justify-center text-[#d4af45]">
                    <IconeMenu tipo="pedidos" />
                  </Link>
                  <Link to="/minha-conta" aria-label="Minha conta"
                    className="nav-icone inline-flex items-center justify-center text-[#d4af45]">
                    <IconeMenu tipo="conta" />
                  </Link>
                </>
              )}

              <span className="text-[#c6c0b5]">Olá, {nomeExibido}</span>
              <button onClick={sair} className="nav-link text-[#d4af45]">
                Sair
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link text-[#d4af45]">Entrar</Link>
              <Link to="/cadastro" className="nav-link text-[#d4af45]">Cadastrar</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
