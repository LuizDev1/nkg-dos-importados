import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listarPedidosAdmin, atualizarStatusPedido } from '../../servicos/pedidoService';

const STATUS_OPCOES = ['pendente', 'pago', 'recusado', 'cancelado'];

const STATUS_CORES = {
  pendente: 'text-yellow-600',
  pago: 'text-green-600',
  recusado: 'text-red-600',
  cancelado: 'text-gray-400',
};

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  async function carregar() {
    try {
      setCarregando(true);
      const dados = await listarPedidosAdmin();
      setPedidos(dados);
    } catch (erro) {
      setErro(erro.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function aoMudarStatus(pedidoId, novoStatus) {
    try {
      await atualizarStatusPedido(pedidoId, novoStatus);
      await carregar();
    } catch (erro) {
      setErro(erro.message);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to="/admin" className="text-blue-600 hover:underline text-sm">
        &larr; Voltar ao painel
      </Link>

      <h1 className="text-2xl font-bold mt-2 mb-6">Pedidos</h1>

      {erro && <p className="text-red-600 mb-4">{erro}</p>}

      {carregando ? (
        <p>Carregando pedidos...</p>
      ) : (
        <table className="w-full bg-white rounded-lg shadow overflow-hidden">
          <thead className="bg-gray-100 text-left text-sm">
            <tr>
              <th className="p-3">Cliente</th>
              <th className="p-3">Total</th>
              <th className="p-3">Data</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((pedido) => (
              <tr key={pedido.id} className="border-t text-sm">
                <td className="p-3">
                  <p>{pedido.usuario_nome}</p>
                  <p className="text-gray-400 text-xs">{pedido.usuario_email}</p>
                </td>
                <td className="p-3">
                  {Number(pedido.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
                <td className="p-3">
                  {new Date(pedido.criado_em).toLocaleDateString('pt-BR')}
                </td>
                <td className="p-3">
                  <select
                    value={pedido.payment_status}
                    onChange={(e) => aoMudarStatus(pedido.id, e.target.value)}
                    className={`border rounded px-2 py-1 bg-white ${STATUS_CORES[pedido.payment_status]}`}
                  >
                    {STATUS_OPCOES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
