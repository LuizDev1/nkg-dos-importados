import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { buscarMeuPedido } from '../../servicos/pedidoService';

const STATUS = {
  pendente: {
    texto: 'Aguardando pagamento',
    classe: 'bg-yellow-100 text-yellow-700',
  },
  pago: {
    texto: 'Pagamento aprovado',
    classe: 'bg-green-100 text-green-700',
  },
  recusado: {
    texto: 'Pagamento recusado',
    classe: 'bg-red-100 text-red-700',
  },
  cancelado: {
    texto: 'Cancelado',
    classe: 'bg-gray-200 text-gray-600',
  },
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
          className="text-blue-600 hover:underline"
        >
          Voltar para meus pedidos
        </Link>
      </div>
    );
  }

  const status = STATUS[pedido.payment_status] || {
    texto: pedido.payment_status,
    classe: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link
        to="/minha-conta/pedidos"
        className="text-blue-600 hover:underline text-sm"
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
            <strong>Tipo de entrega:</strong>{' '}
            {pedido.tipo_entrega === 'envio'
              ? 'Envio'
              : 'Entrega local'}
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
              pedido.subtotal ?? Number(pedido.total) - Number(pedido.frete || 0)
            )}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Frete</span>
          <span>{formatarValor(pedido.frete || 0)}</span>
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
