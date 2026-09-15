import { Link } from 'react-router-dom';
import { useAutenticacao } from '../../contextos/ContextoAutenticacao';

export default function Painel() {
  const { usuario, logout } = useAutenticacao();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Painel administrativo</h1>
        <div className="flex items-center gap-4">
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/admin/produtos"
          className="bg-white rounded-lg shadow hover:shadow-md transition p-6 text-center font-semibold"
        >
          Produtos
        </Link>
        <Link
          to="/admin/pedidos"
          className="bg-white rounded-lg shadow hover:shadow-md transition p-6 text-center font-semibold"
        >
          Pedidos
        </Link>
        <Link
          to="/admin/relatorios"
          className="bg-white rounded-lg shadow hover:shadow-md transition p-6 text-center font-semibold"
        >
          Relatórios
        </Link>
        <Link
          to="/admin/configuracoes"
          className="bg-white rounded-lg shadow hover:shadow-md transition p-6 text-center font-semibold"
        >
          Configurações
        </Link>
        <Link
          to="/admin/promocoes"
          className="bg-white rounded-lg shadow hover:shadow-md transition p-6 text-center font-semibold"
        >
          Promoções
        </Link>
        <Link
          to="/admin/banners"
          className="bg-white rounded-lg shadow hover:shadow-md transition p-6 text-center font-semibold"
        >
          Banners
        </Link>
        <Link
        to="/admin/clientes"
        className="bg-white rounded-lg shadow hover:shadow-md transition p-6 text-center font-semibold"
        >
        Clientes
        </Link>
      </div>
    </div>
  );
}
