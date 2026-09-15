import { Link, useLocation } from 'react-router-dom';
import { useCarrinho } from '../contextos/ContextoCarrinho';
import { useAutenticacao } from '../contextos/ContextoAutenticacao';

export default function Cabecalho() {
  const { quantidadeTotal } = useCarrinho();
  const { usuario, logout } = useAutenticacao();
  const location = useLocation();
  const isAdmin = usuario?.perfil === 'admin';
  const ocultarCarrinho = ['/login', '/cadastro'].includes(location.pathname);

  return (
    <header className="sticky top-0 z-50 bg-[#090a09]/95 shadow-[0_8px_28px_rgba(0,0,0,0.16)] backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap justify-between items-center gap-4">
        <Link to={isAdmin ? '/admin' : '/'} className="text-xl font-black uppercase tracking-[0.12em] text-[#d4af45]">
          NKG <span>dos Importados</span>
        </Link>

        <nav className="flex flex-wrap items-center gap-5 text-xs uppercase tracking-[0.08em]">
          
          {!isAdmin && !ocultarCarrinho && (
            <Link to="/carrinho" className="nav-link relative text-[#d4af45]">
              Carrinho
              {quantidadeTotal > 0 && (
                <span className="absolute -top-2 -right-4 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
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
                  <Link to="/favoritos" className="nav-link text-[#d4af45]">Favoritos</Link>
                  <Link to="/minha-conta/pedidos" className="nav-link text-[#d4af45]">Meus pedidos</Link>
                  <Link to="/minha-conta" className="nav-link text-[#d4af45]">Minha conta</Link>
                </>
              )}

              <span className="text-[#c6c0b5]">Olá, {usuario.nome}</span>
              <button onClick={logout} className="nav-link text-[#d4af45]">
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
