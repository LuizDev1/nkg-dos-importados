import { corStatus } from '../../servicos/statusVisual';
import { useEffect, useState } from 'react';
import { avisarAdmin } from '../../utilitarios/avisoAdmin';
import { Link } from 'react-router-dom';
import TabelaRolavel from '../../componentes/TabelaRolavel';
import { listarPedidosAdmin, atualizarStatusOperacional } from '../../servicos/pedidoService';

const TRANSICOES = {
  pago: ['em_preparacao', 'cancelado'],
  em_preparacao: ['enviado', 'cancelado'],
  enviado: ['entregue'],
  reembolso_pendente: ['reembolsado'],
};

const STATUS_LABELS = {
  aguardando_pagamento: 'Aguardando confirmação',
  pendente: 'Pendente',
  pago: 'Pagamento aprovado',
  recusado: 'Pagamento recusado',
  cancelado: 'Cancelado',
  em_preparacao: 'Em preparação',
  enviado: 'Enviado',
  entregue: 'Entregue',
  reembolso_pendente: 'Reembolso em processamento',
  reembolsado: 'Reembolso concluído',
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
      await atualizarStatusOperacional(pedidoId, novoStatus);
      await carregar();
      avisarAdmin('Status do pedido atualizado com sucesso.');
    } catch (erro) {
      setErro(erro.message);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to="/admin" className="botao-voltar">
        &larr; Voltar ao painel
      </Link>

      <h1 className="text-2xl font-bold mt-2 mb-6">Pedidos</h1>

      <div role="alert" className={erro ? "text-erro mb-4" : ""}>{erro}</div>

      {carregando ? (
        <p role="status">Carregando pedidos...</p>
      ) : !pedidos.length ? (!erro && (
        <div className="rounded-lg border border-[#29261d] bg-[#111210] p-8 text-center">
          <p className="font-semibold">Nenhum pedido ainda</p>
          <p className="mt-1 text-sm text-texto-secundario">Quando um cliente finalizar uma compra, o pedido aparece aqui com o pagamento e a etapa da entrega.</p>
          <Link to="/admin/produtos" className="mt-4 inline-flex rounded border border-borda-campo px-4 py-2 font-semibold text-link hover:border-link">Revisar produtos à venda</Link>
        </div>
      )) : (
        <TabelaRolavel rotulo="Pedidos">
        <table className="w-full bg-white rounded-lg shadow overflow-hidden">
          <thead className="bg-gray-100 text-left text-sm">
            <tr>
              <th className="p-3">Cliente</th>
              <th className="p-3">Total</th>
              <th className="p-3">Data</th>
              <th className="p-3">Pagamento</th>
              <th className="p-3">Operação</th>
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
                <td className={`p-3 ${corStatus(pedido.payment_status)}`}>
                  {STATUS_LABELS[pedido.payment_status] || pedido.payment_status}
                </td>
                <td className="p-3">
                  {(() => {
                    const opcoes = TRANSICOES[pedido.status_pedido] || [];
                    return (
                  <select
                    value=""
                    disabled={opcoes.length === 0}
                    onChange={(e) => aoMudarStatus(pedido.id, e.target.value)}
                    className={`border rounded px-2 py-1 bg-white ${corStatus(pedido.status_pedido)}`}
                  >
                    <option value="">{STATUS_LABELS[pedido.status_pedido] || 'Sem status'}</option>
                    {opcoes.map((status) => (
                      <option key={status} value={status}>
                        {STATUS_LABELS[status] || status}
                      </option>
                    ))}
                  </select>
                    );
                  })()}
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
