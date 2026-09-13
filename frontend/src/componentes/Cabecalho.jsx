import { Link } from 'react-router-dom';
import { useCarrinho } from '../contextos/ContextoCarrinho';
import { useAutenticacao } from '../contextos/ContextoAutenticacao';

export default function Cabecalho() {
  const { quantidadeTotal } = useCarrinho();
  const { usuario, logout } = useAutenticacao();

  return (
    <header className="bg-white shadow">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          NKG dos Importados
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          <Link to="/carrinho" className="relative">
            Carrinho
            {quantidadeTotal > 0 && (
              <span className="absolute -top-2 -right-4 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {quantidadeTotal}
              </span>
            )}
          </Link>

          {usuario?.perfil === 'admin' && (
            <Link to="/admin" className="text-gray-600 hover:text-blue-600">
              Admin
            </Link>
          )}

          {usuario ? (
            <>
              <span className="text-gray-500">Olá, {usuario.nome}</span>
              <button onClick={logout} className="text-red-600 hover:underline">
                Sair
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-blue-600 hover:underline">
                Entrar
              </Link>
              <Link to="/cadastro" className="text-blue-600 hover:underline">
                Cadastrar
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
