import TabelaRolavel from '../../componentes/TabelaRolavel';
import Botao from '../../componentes/ui/Botao';
import Preco from '../../componentes/ui/Preco';
import SeloStatus from '../../componentes/ui/SeloStatus';
import { useEffect, useState } from 'react';
import { avisarAdmin } from '../../utilitarios/avisoAdmin';
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
    let ativo = true;
    listarClientes('').then((lista) => {
      if (ativo) {
        setClientes(lista);
        setCarregando(false);
      }
    }).catch((erro) => {
      if (ativo) {
        setErro(erro.message);
        setCarregando(false);
      }
    });
    return () => { ativo = false; };
  }, []);

  async function alterarStatus(cliente) {
    const novoStatus =
      cliente.status === 'bloqueado' ? 'ativo' : 'bloqueado';

    try {
      await atualizarStatusCliente(cliente.id, novoStatus);
      await carregar();
      avisarAdmin(novoStatus === 'ativo' ? 'Cliente reativado com sucesso.' : 'Cliente bloqueado com sucesso.');
    } catch (erro) {
      setErro(erro.message);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link to="/admin" className="botao-voltar">
        &larr; Voltar ao painel
      </Link>

      <h1 className="text-2xl font-bold mt-2 mb-6">Clientes</h1>

      <form
        onSubmit={(evento) => {
          evento.preventDefault();
          carregar();
        }}
        className="flex items-end gap-2 mb-6"
      >
        <label className="flex-1 min-w-0 text-sm text-[#aaa399]">
          Buscar cliente por nome ou e-mail
        <input
          type="search"
          name="busca"
          autoComplete="off"
          value={busca}
          onChange={(evento) => setBusca(evento.target.value)}
          placeholder="Buscar por nome ou e-mail"
          className="mt-2 w-full border rounded px-3 py-2"
        />
        </label>

        <Botao type="submit" variante="secundario">
          Buscar
        </Botao>
      </form>

      <div role="alert" className={erro ? "text-erro mb-4" : ""}>{erro}</div>

      {carregando ? (
        <p>Carregando clientes...</p>
      ) : (
        <TabelaRolavel rotulo="Clientes">
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
                    <Preco valor={cliente.total_gasto} />
                  </td>

                  <td className="p-3">
                    <SeloStatus status={cliente.status === 'bloqueado' ? 'bloqueado' : 'ativo'}>
                      {cliente.status === 'bloqueado'
                        ? 'Bloqueado'
                        : 'Ativo'}
                    </SeloStatus>
                  </td>

                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <Botao
                        variante="discreto"
                        tamanho="sm"
                        para={`/admin/clientes/${cliente.id}`}
                        aria-label={`Ver detalhes de ${cliente.nome}`}
                      >
                        Ver detalhes
                      </Botao>

                      <Botao
                        variante={cliente.status === 'bloqueado' ? 'secundario' : 'destrutivo'}
                        tamanho="sm"
                        onClick={() => alterarStatus(cliente)}
                        aria-label={`${cliente.status === 'bloqueado' ? 'Desbloquear' : 'Bloquear'} ${cliente.nome}`}
                      >
                        {cliente.status === 'bloqueado'
                          ? 'Desbloquear'
                          : 'Bloquear'}
                      </Botao>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TabelaRolavel>
      )}
    </div>
  );
}
