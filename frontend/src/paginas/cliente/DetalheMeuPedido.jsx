import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { buscarMeuPedido } from '../../servicos/pedidoService';

const STATUS = {
  pendente: {
    texto: 'Aguardando pagamento',
    classe: 'border border-amber-500/50 bg-amber-500/15 text-amber-200',
  },
  pago: {
    texto: 'Pagamento aprovado',
    classe: 'border border-emerald-500/50 bg-emerald-500/15 text-emerald-200',
  },
  recusado: {
    texto: 'Pagamento recusado',
    classe: 'border border-red-500/50 bg-red-500/15 text-red-200',
  },
  cancelado: {
    texto: 'Cancelado',
    classe: 'border border-zinc-500/60 bg-zinc-500/20 text-zinc-200',
  },
};

const STATUS_PEDIDO = {
  aguardando_pagamento: 'Aguardando pagamento',
  pago: 'Pagamento aprovado',
  em_preparacao: 'Em preparação',
  enviado: 'Enviado',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
  reembolso_pendente: 'Reembolso pendente',
  reembolsado: 'Reembolsado',
};

function formatarValor(valor) {
  return Number(valor).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export default function DetalheMeuPedido() {
  const { id } = useParams();

  const [pedido, setPedido] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    async function carregarPedido() {
      try {
        const dados = await buscarMeuPedido(id);
        setPedido(dados);
      } catch (erro) {
        setErro(erro.message);
      } finally {
        setCarregando(false);
      }
    }

    carregarPedido();
  }, [id]);

  if (carregando) {
    return (
      <p className="text-center mt-10">
        Carregando pedido...
      </p>
    );
  }

  if (erro || !pedido) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 text-center">
        <p className="text-red-600 mb-4">
          {erro || 'Pedido não encontrado'}
        </p>

        <Link
          to="/minha-conta/pedidos"
          className="botao-voltar"
        >
          Voltar para meus pedidos
        </Link>
      </div>
    );
  }

  const status = STATUS[pedido.payment_status] || {
    texto: pedido.payment_status,
    classe: 'border border-[#8f793d] bg-[#d4af45]/15 text-[#f0d77e]',
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link
        to="/minha-conta/pedidos"
        className="botao-voltar"
      >
        &larr; Voltar para meus pedidos
      </Link>

      <div className="mt-4 mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Pedido #{pedido.numero_cliente}
          </h1>

          <p className="text-sm text-gray-500">
            Realizado em{' '}
            {new Date(pedido.criado_em).toLocaleString('pt-BR')}
          </p>
        </div>

        <span
          className={`self-start rounded-full px-3 py-1 text-sm ${status.classe}`}
        >
          {status.texto}
        </span>
      </div>

      <section className="bg-white rounded-lg shadow p-5 mb-6">
        <h2 className="text-lg font-semibold mb-4">
          Informações da entrega
        </h2>

        <div className="space-y-2 text-sm">
          <p>
            <strong>Status do pedido:</strong>{' '}
            {STATUS_PEDIDO[pedido.status_pedido] || pedido.status_pedido || 'Ainda não disponível'}
          </p>
          <p>
            <strong>Tipo de entrega:</strong>{' '}
            {pedido.tipo_entrega === 'envio'
              ? 'Envio'
              : 'Entrega própria'}
          </p>

          <p>
            <strong>Endereço:</strong>{' '}
            {pedido.endereco_entrega}
          </p>

          <p>
            <strong>Telefone:</strong>{' '}
            {pedido.telefone_contato}
          </p>

          <p>
            <strong>Código de rastreio:</strong>{' '}
            {pedido.codigo_rastreio || 'Ainda não disponível'}
          </p>
        </div>
      </section>

      <section className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <h2 className="text-lg font-semibold p-5">
          Produtos comprados
        </h2>

        <div className="divide-y">
          {(pedido.itens || []).map((item) => (
            <div
              key={item.id}
              className="p-5 flex flex-col gap-4 sm:flex-row"
            >
              <img
                src={item.foto_url || 'https://placehold.co/120'}
                alt={item.produto_nome}
                className="w-24 h-24 rounded object-cover"
              />

              <div className="flex-1">
                <Link
                  to={`/produto/${item.produto_id}`}
                  className="font-semibold hover:text-blue-600"
                >
                  {item.produto_nome}
                </Link>

                <p className="text-sm text-gray-500 mt-1">
                  Quantidade: {item.quantidade}
                </p>

                {item.variacao_nome && (
                  <p className="text-sm text-gray-500">Variação: {item.variacao_nome}</p>
                )}

                <p className="text-sm text-gray-500">
                  Preço unitário: {formatarValor(item.preco_unitario)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Subtotal
                </p>

                <p className="font-semibold">
                  {formatarValor(
                    Number(item.preco_unitario) * item.quantidade
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-lg shadow p-5 space-y-3">
        <div className="flex justify-between">
          <span>Subtotal dos produtos</span>
          <span>
            {formatarValor(
              pedido.subtotal ?? Number(pedido.total) - Number(pedido.frete || 0) + Number(pedido.desconto || 0)
            )}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Frete</span>
          <span>{formatarValor(pedido.frete || 0)}</span>
        </div>

        <div className="flex justify-between">
          <span>Desconto</span>
          <span>{Number(pedido.desconto || 0) > 0 ? '- ' : ''}{formatarValor(pedido.desconto || 0)}</span>
        </div>

        <div className="border-t pt-3 flex justify-between">
          <span className="font-semibold">Total do pedido</span>
          <span className="text-xl font-bold">
            {formatarValor(pedido.total)}
          </span>
        </div>
      </section>
    </div>
  );
}
