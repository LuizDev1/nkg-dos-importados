import { Navigate, useLocation } from 'react-router-dom';
import { useAutenticacao } from '../contextos/ContextoAutenticacao';

export default function RotaPrivada({ children, somenteAdmin = false, somenteCliente = false }) {
  const { usuario, carregando } = useAutenticacao();
  const location = useLocation();

  if (carregando) {
    return <p className="text-center mt-10">Carregando...</p>;
  }

  if (!usuario) {
    return (
      <Navigate
        to="/login"
        state={{
          from: location.pathname + location.search + location.hash,
        }}
        replace
      />
    );
  }

  if (somenteAdmin && usuario.perfil !== 'admin') {
    return <Navigate to="/" replace />;
  }

  if (somenteCliente && usuario.perfil === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
