import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, Package, User } from 'lucide-react';
import { useCarrinho } from '../contextos/ContextoCarrinho';
import { useAutenticacao } from '../contextos/ContextoAutenticacao';

export default function Cabecalho() {
  const { quantidadeTotal } = useCarrinho();
  const { usuario, logout } = useAutenticacao();
  const location = useLocation();
  const navigate = useNavigate();

  const [badgeAnimando, setBadgeAnimando] = useState(false);
  const quantidadeAnterior = useRef(quantidadeTotal);

  useEffect(() => {
    if (quantidadeTotal > quantidadeAnterior.current) {
      setBadgeAnimando(true);
      const timer = setTimeout(() => setBadgeAnimando(false), 600);
      quantidadeAnterior.current = quantidadeTotal;
      return () => clearTimeout(timer);
    }
    quantidadeAnterior.current = quantidadeTotal;
  }, [quantidadeTotal]);

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
        <Link
          to={isAdmin ? '/admin' : '/'}
          className="text-xl font-black uppercase tracking-[0.12em] text-[#d4af45] transition-transform duration-200 hover:scale-102"
        >
          NKG <span>dos Importados</span>
        </Link>

        <nav className="flex flex-wrap items-center gap-5 text-xs uppercase tracking-[0.08em]">
          {!isAdmin && !ocultarCarrinho && (
            <Link
              to="/carrinho"
              aria-label="Carrinho"
              className="nav-icone relative inline-flex items-center justify-center text-[#d4af45]"
            >
              <ShoppingBag className="h-5 w-5 transition-transform duration-200 hover:scale-110" />
              {quantidadeTotal > 0 && (
                <span
                  className={`absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#d4af45] px-1 text-[10px] font-bold text-[#090a09] transition-all ${
                    badgeAnimando ? 'anim-badge-pulse' : ''
                  }`}
                >
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
                  <Link
                    to="/favoritos"
                    aria-label="Favoritos"
                    className="nav-icone inline-flex items-center justify-center text-[#d4af45]"
                  >
                    <Heart className="h-5 w-5 transition-transform duration-200 hover:scale-110" />
                  </Link>
                  <Link
                    to="/minha-conta/pedidos"
                    aria-label="Meus pedidos"
                    className="nav-icone inline-flex items-center justify-center text-[#d4af45]"
                  >
                    <Package className="h-5 w-5 transition-transform duration-200 hover:scale-110" />
                  </Link>
                  <Link
                    to="/minha-conta"
                    aria-label="Minha conta"
                    className="nav-icone inline-flex items-center justify-center text-[#d4af45]"
                  >
                    <User className="h-5 w-5 transition-transform duration-200 hover:scale-110" />
                  </Link>
                </>
              )}

              <span className="text-[#c6c0b5]">Olá, {nomeExibido}</span>
              <button
                type="button"
                onClick={sair}
                className="nav-link text-[#d4af45]"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link text-[#d4af45]">
                Entrar
              </Link>
              <Link to="/cadastro" className="nav-link text-[#d4af45]">
                Cadastrar
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
