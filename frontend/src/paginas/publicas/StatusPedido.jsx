import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCarrinho } from '../../contextos/ContextoCarrinho';
import { useAutenticacao } from '../../contextos/ContextoAutenticacao';
import { buscarPedido } from '../../servicos/pedidoService';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const CONTEUDO = {
  sucesso: {
    titulo: 'Pagamento aprovado!',
    mensagem: 'Seu pedido foi confirmado e já está sendo preparado.',
    cor: 'text-green-600',
  },
  pendente: {
    titulo: 'Pagamento em análise',
    mensagem: 'Assim que for confirmado, seu pedido será processado.',
    cor: 'text-yellow-600',
  },
  falha: {
    titulo: 'Pagamento não concluído',
    mensagem: 'Algo deu errado ou a compra foi cancelada. Você pode tentar novamente.',
    cor: 'text-red-600',
  },
};

export default function StatusPedido() {
  const { id, resultado } = useParams();
  const { limparCarrinho } = useCarrinho();
  const { token } = useAutenticacao();
  const sincronizado = useRef(false);
  const pedidoAtualRef = useRef(null);
  const [pedido, setPedido] = useState(null);
  const [erroPedido, setErroPedido] = useState('');
  
  let conteudo;

  if (pedido) {
    if (['pago', 'em_preparacao', 'enviado', 'entregue'].includes(pedido.status_pedido)) {
      conteudo = CONTEUDO.sucesso;
      if (pedido.status_pedido === 'enviado') {
        conteudo = { ...conteudo, titulo: 'Pedido Enviado!', mensagem: 'Seu pedido já está a caminho do seu endereço.' };
      }
    } else if (pedido.status_pedido === 'aguardando_pagamento') {
      conteudo = CONTEUDO.pendente;
    } else {
      conteudo = CONTEUDO.falha;
    }
  } else {
    if (resultado === 'acompanhamento') {
      conteudo = { titulo: 'Buscando informações...', mensagem: 'Aguarde um momento.', cor: 'text-gray-500' };
    } else {
      conteudo = CONTEUDO[resultado] || CONTEUDO.falha;
    }
  }

  useEffect(() => {
    if (resultado === 'sucesso') {
      limparCarrinho();
    }

    async function carregarPedido() {
      if (!token) return;
      try {
        const dados = await buscarPedido(id);
        pedidoAtualRef.current = dados;
        setPedido(dados);
        setErroPedido('');
      } catch (erro) {
        setErroPedido(erro.message);
      }
    }

    if (resultado === 'sucesso' || resultado === 'falha') {
      const parametros = new URLSearchParams(window.location.search);
      const paymentId = parametros.get('payment_id') || parametros.get('collection_id');
      if (paymentId && token && !sincronizado.current) {
        sincronizado.current = true;
        fetch(`${API_URL}/pagamentos/${id}/sincronizar`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ payment_id: paymentId }),
        }).catch(() => {}).finally(carregarPedido);
      } else {
        carregarPedido();
      }
    } else {
      carregarPedido();
    }

    const intervalo = setInterval(() => {
      if (!pedidoAtualRef.current || ['entregue', 'cancelado', 'reembolsado'].includes(pedidoAtualRef.current.status_pedido)) return;
      carregarPedido();
    }, 10000);

    return () => clearInterval(intervalo);
  }, [resultado, id, token]);

  const etapas = [
    ['aguardando_pagamento', 'Aguardando confirmação do pagamento'],
    ['pago', 'Pagamento aprovado'],
    ['em_preparacao', 'Em preparação'],
    ['enviado', 'Enviado'],
    ['entregue', 'Entregue'],
  ];
  const etapaAtual = etapas.findIndex(([status]) => status === pedido?.status_pedido);

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <h1 className={`text-2xl font-bold mb-3 ${conteudo.cor}`}>{conteudo.titulo}</h1>
      <p className="text-gray-600 mb-2">{conteudo.mensagem}</p>
      <p className="text-sm text-gray-400 mb-6">Pedido #{id}</p>

      {erroPedido && <p className="text-sm text-red-600 mb-4">{erroPedido}</p>}

      {pedido && (
        <div className="text-left bg-white border rounded-lg p-5 mb-6">
          <p className="font-semibold mb-4">Acompanhamento</p>
          <ol className="space-y-3">
            {etapas.map(([status, titulo], indice) => (
              <li key={status} className={indice <= etapaAtual ? 'text-green-600' : 'text-gray-400'}>
                <span className="inline-block w-5">{indice <= etapaAtual ? '✓' : '○'}</span>
                {titulo}
              </li>
            ))}
          </ol>
          {pedido.status_pedido === 'cancelado' && (
            <p className="text-red-600 mt-4">Pedido cancelado.</p>
          )}
          {pedido.status_pedido === 'reembolso_pendente' && (
            <p className="text-yellow-600 mt-4">Reembolso em processamento.</p>
          )}
          {pedido.codigo_rastreio && (
            <p className="mt-4 text-sm">Código de rastreio: <strong>{pedido.codigo_rastreio}</strong></p>
          )}
        </div>
      )}

      <Link to="/" className="text-blue-600 hover:underline">
        Voltar para a loja
      </Link>
    </div>
  );
}