import { corStatus } from '../../servicos/statusVisual';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listarPedidosPorUsuario } from '../../servicos/pedidoService';
import { useAutenticacao } from '../../contextos/ContextoAutenticacao';

const STATUS = {
  aguardando_pagamento: 'Aguardando confirmação',
  pago: 'Pagamento aprovado',
  em_preparacao: 'Em preparação',
  enviado: 'Enviado',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
  reembolso_pendente: 'Reembolso em processamento',
  reembolsado: 'Reembolso concluído',
};

export default function MeusPedidos() {
  const { usuario } = useAutenticacao();
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    async function carregar() {
      try {
        setPedidos(await listarPedidosPorUsuario(usuario.id));
      } catch (erroCarregamento) {
        setErro(erroCarregamento.message);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, [usuario.id]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Meus pedidos</h1>
      {carregando && <p>Carregando pedidos...</p>}
      {erro && <p className="text-red-600">{erro}</p>}
      {!carregando && !erro && pedidos.length === 0 && (
        <p className="text-gray-500">Você ainda não fez nenhum pedido.</p>
      )}
      {!carregando && pedidos.length > 0 && (
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
                  <td className="p-3">{Number(pedido.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                  <td className={`p-3 ${corStatus(pedido.status_pedido || pedido.payment_status)}`}>{STATUS[pedido.status_pedido] || STATUS[pedido.payment_status] || 'Em análise'}</td>
                  <td className="p-3">{new Date(pedido.criado_em).toLocaleDateString('pt-BR')}</td>
                  <td className="p-3"><Link to={`/pedido/${pedido.id}/acompanhamento`} className="text-blue-600 hover:underline">Acompanhar</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
