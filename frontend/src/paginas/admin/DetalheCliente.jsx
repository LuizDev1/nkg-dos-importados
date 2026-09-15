import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { listarClientes } from '../../servicos/usuarioService';
import FormularioConta from '../../componentes/FormularioConta';
import { salvarContaCliente } from '../../servicos/contaService';
import { listarPedidosPorUsuario } from '../../servicos/pedidoService';

export default function DetalheCliente() {
  const { id } = useParams();
  const [cliente, setCliente] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        const clientes = await listarClientes();
        const clienteEncontrado = clientes.find(
          (item) => String(item.id) === String(id)
        );

        if (!clienteEncontrado) {
          throw new Error('Cliente não encontrado');
        }

        const pedidosCliente = await listarPedidosPorUsuario(id);

        setCliente(clienteEncontrado);
        setPedidos(pedidosCliente);
      } catch (erro) {
        setErro(erro.message);
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, [id]);

  if (carregando) {
    return <p className="text-center mt-10">Carregando cliente...</p>;
  }

  if (erro) {
    return <p className="text-center mt-10 text-red-600">{erro}</p>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link
        to="/admin/clientes"
        className="text-blue-600 hover:underline text-sm"
      >
        &larr; Voltar para clientes
      </Link>

      <h1 className="text-2xl font-bold mt-2 mb-6">
        Detalhes do cliente
      </h1>

      <div className="bg-white rounded-lg shadow p-5 mb-6">
        <p><strong>Nome:</strong> {cliente.nome}</p>
        <p><strong>E-mail:</strong> {cliente.email}</p>
        <p><strong>CPF:</strong> {cliente.cpf || 'Não informado'}</p>
        <p>
          <strong>Status:</strong>{' '}
          {cliente.status === 'bloqueado' ? 'Bloqueado' : 'Ativo'}
        </p>
      </div>

      <h2 className="text-xl font-semibold mb-3">
        Editar informações do cliente
      </h2>
      <section className="bg-white rounded-lg shadow p-5 mb-6">
        <FormularioConta key={id} conta={cliente} salvar={(dados) => salvarContaCliente(id, dados)}
          aoSalvar={(dados) => setCliente((anterior) => ({ ...anterior, ...dados }))} />
      </section>

      <h2 className="text-xl font-semibold mb-3">
        Histórico de pedidos
      </h2>

      {pedidos.length === 0 ? (
        <p className="text-gray-500">
          Este cliente ainda não possui pedidos.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-lg shadow text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Pedido</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
                <th className="p-3">Data</th>
                <th className="p-3">Ação</th>
              </tr>
            </thead>

            <tbody>
              {pedidos.map((pedido) => (
                <tr key={pedido.id} className="border-t">
                  <td className="p-3">#{pedido.id}</td>

                  <td className="p-3">
                    {Number(pedido.total).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </td>

                  <td className="p-3">{pedido.payment_status}</td>

                  <td className="p-3">
                    {new Date(pedido.criado_em).toLocaleDateString('pt-BR')}
                  </td>

                  <td className="p-3">
                    <Link
                      to={`/admin/pedidos/${pedido.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Ver pedido
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
