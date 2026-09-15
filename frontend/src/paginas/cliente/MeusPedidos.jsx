import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listarMeusPedidos } from '../../servicos/pedidoService';

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

export default function MeusPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    async function carregarPedidos() {
      try {
        const dados = await listarMeusPedidos();
        setPedidos(dados);
      } catch (erro) {
        setErro(erro.message);
      } finally {
        setCarregando(false);
      }
    }

    carregarPedidos();
  }, []);

  if (carregando) {
    return (
      <p className="text-center mt-10">
        Carregando seus pedidos...
      </p>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Meus pedidos</h1>

      {erro && (
        <p className="text-red-600 bg-red-50 rounded p-3 mb-4">
          {erro}
        </p>
      )}

      {!erro && pedidos.length === 0 && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 mb-4">
            Você ainda não realizou nenhum pedido.
          </p>

          <Link
            to="/"
            className="text-blue-600 hover:underline"
          >
            Ver produtos
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {pedidos.map((pedido) => {
          const status = STATUS[pedido.payment_status] || {
            texto: pedido.payment_status,
            classe: 'bg-gray-100 text-gray-700',
          };

          return (
            <article
              key={pedido.id}
              className="bg-white rounded-lg shadow p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-semibold text-lg">
                    Pedido #{pedido.numero_cliente}
                  </h2>

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

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm text-gray-500">Valor total</p>

                  <p className="font-bold text-lg">
                    {Number(pedido.total).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </p>

                  {pedido.codigo_rastreio && (
                    <p className="mt-2 text-sm text-gray-600">
                      Rastreio: {pedido.codigo_rastreio}
                    </p>
                  )}
                </div>

                <Link
                  to={`/minha-conta/pedidos/${pedido.id}`}
                  className="text-blue-600 hover:underline"
                >
                  Ver detalhes
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}