import { corStatus } from '../../servicos/statusVisual';
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
    classe: 'border border-red-500/50 bg-red-500/15 text-red-200',
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

const ETAPAS_ENTREGA = [
  ['pago', 'Pagamento aprovado'],
  ['em_preparacao', 'Em preparação'],
  ['enviado', 'Enviado'],
  ['entregue', 'Entregue'],
];

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
  const etapaAtual = ETAPAS_ENTREGA.findIndex(([chave]) => chave === pedido.status_pedido);
  const rastreioUrl = pedido.codigo_rastreio
    ? `https://rastreamento.correios.com.br/app/index.php?objetos=${encodeURIComponent(pedido.codigo_rastreio)}`
    : null;

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

      {!['cancelado', 'reembolso_pendente', 'reembolsado'].includes(pedido.status_pedido) && (
        <section className="mb-6 rounded-lg bg-white p-5 shadow" aria-label="Andamento do pedido">
          <h2 className="mb-5 text-lg font-semibold">Andamento do pedido</h2>
          <ol className="grid grid-cols-2 gap-y-5 sm:grid-cols-4">
            {ETAPAS_ENTREGA.map(([chave, titulo], indice) => {
              const concluida = etapaAtual >= indice;
              const atual = etapaAtual === indice;
              return <li key={chave} className="flex items-center gap-2 pr-2 text-sm">
                <span aria-hidden="true" className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${concluida ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>{concluida ? '✓' : indice + 1}</span>
                <span className={atual ? 'font-semibold text-blue-700' : concluida ? 'text-gray-800' : 'text-gray-500'}>{titulo}</span>
              </li>;
            })}
          </ol>
        </section>
      )}

      <section className="bg-white rounded-lg shadow p-5 mb-6">
        <h2 className="text-lg font-semibold mb-4">
          Informações da entrega
        </h2>

        <div className="space-y-2 text-sm">
          <p>
            <strong>Status do pedido:</strong>{' '}
            <span className={corStatus(pedido.status_pedido)}>
              {STATUS_PEDIDO[pedido.status_pedido] || pedido.status_pedido || 'Ainda não disponível'}
            </span>
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
            {rastreioUrl ? <a href={rastreioUrl} target="_blank" rel="noreferrer" className="font-medium text-blue-700 underline hover:text-blue-900">{pedido.codigo_rastreio} (acompanhar entrega)</a> : 'Ainda não disponível'}
          </p>
        </div>
      </section>

      <section className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <h2 className="text-lg font-semibold p-5">
          Produtos comprados
        </h2>

        {pedido.status_pedido === 'entregue' && (
          <div className="mx-5 mb-5 rounded-lg border border-[#d4af45]/50 bg-[#d4af45]/10 p-4">
            <p className="font-semibold text-[#d4af45]">Seu pedido foi entregue. Conte como foi sua experiência.</p>
            <p className="mt-1 text-sm text-[#c7c0b4]">Você pode avaliar cada produto comprado uma vez.</p>
          </div>
        )}

        <div className="divide-y">
          {(pedido.itens || []).map((item) => (
            <div
              key={item.id}
              className="p-5 flex flex-col gap-4 sm:flex-row"
            >
              {item.foto_url ? (
                <img src={item.foto_url} alt={item.produto_nome} className="w-24 h-24 rounded object-cover" />
              ) : (
                <div role="img" aria-label={`Imagem indisponível de ${item.produto_nome}`} className="flex h-24 w-24 shrink-0 items-center justify-center rounded bg-gray-200 text-center text-[10px] text-gray-500">Sem imagem</div>
              )}

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

                {pedido.status_pedido === 'entregue' && (
                  <Link
                    to={`/produto/${item.produto_id}#avaliacoes`}
                    className="mt-3 inline-flex rounded border border-[#d4af45] px-3 py-1.5 text-sm font-semibold text-[#d4af45] hover:bg-[#d4af45] hover:text-[#090a09]"
                  >
                    Avaliar produto
                  </Link>
                )}
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
