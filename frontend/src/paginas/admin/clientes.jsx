import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  listarClientes,
  atualizarStatusCliente,
} from '../../servicos/usuarioService';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [busca, setBusca] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  async function carregar() {
    try {
      setErro('');
      setCarregando(true);
      setClientes(await listarClientes(busca));
    } catch (erro) {
      setErro(erro.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function alterarStatus(cliente) {
    const novoStatus =
      cliente.status === 'bloqueado' ? 'ativo' : 'bloqueado';

    try {
      await atualizarStatusCliente(cliente.id, novoStatus);
      await carregar();
    } catch (erro) {
      setErro(erro.message);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link to="/admin" className="text-blue-600 hover:underline text-sm">
        &larr; Voltar ao painel
      </Link>

      <h1 className="text-2xl font-bold mt-2 mb-6">Clientes</h1>

      <form
        onSubmit={(evento) => {
          evento.preventDefault();
          carregar();
        }}
        className="flex gap-2 mb-6"
      >
        <input
          value={busca}
          onChange={(evento) => setBusca(evento.target.value)}
          placeholder="Buscar por nome ou e-mail"
          className="border rounded px-3 py-2 flex-1"
        />

        <button className="bg-black text-white rounded px-4">
          Buscar
        </button>
      </form>

      {erro && <p className="text-red-600 mb-4">{erro}</p>}

      {carregando ? (
        <p>Carregando clientes...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-lg shadow text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Cliente</th>
                <th className="p-3">Pedidos</th>
                <th className="p-3">Total gasto</th>
                <th className="p-3">Status</th>
                <th className="p-3">Ações</th>
              </tr>
            </thead>

            <tbody>
              {clientes.map((cliente) => (
                <tr key={cliente.id} className="border-t">
                  <td className="p-3">
                    <p className="font-medium">{cliente.nome}</p>
                    <p className="text-gray-500">{cliente.email}</p>
                  </td>

                  <td className="p-3">{cliente.quantidade_pedidos}</td>

                  <td className="p-3">
                    {Number(cliente.total_gasto).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </td>

                  <td className="p-3">
                    {cliente.status === 'bloqueado'
                      ? 'Bloqueado'
                      : 'Ativo'}
                  </td>

                  <td className="p-3">
                    <div className="flex flex-col gap-1">
                      <Link
                        to={`/admin/clientes/${cliente.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        Ver detalhes
                      </Link>

                      <button
                        type="button"
                        onClick={() => alterarStatus(cliente)}
                        className="text-left text-blue-600 hover:underline"
                      >
                        {cliente.status === 'bloqueado'
                          ? 'Desbloquear'
                          : 'Bloquear'}
                      </button>
                    </div>
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