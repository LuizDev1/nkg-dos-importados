import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listarMeusPedidos } from '../../servicos/pedidoService';
import { ROTULOS_PAGAMENTO_CLIENTE } from '../../servicos/statusVisual';
import Botao from '../../componentes/ui/Botao';
import Preco from '../../componentes/ui/Preco';
import SeloStatus from '../../componentes/ui/SeloStatus';
import Superficie from '../../componentes/ui/Superficie';

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
      <Link to="/" className="botao-voltar">&larr; Voltar para a loja</Link>
      <h1 className="mt-4 text-2xl font-bold mb-6">Meus pedidos</h1>

      {erro && (
        <p role="alert" className="text-erro-texto bg-erro-fundo border border-erro-borda rounded-cartao p-3 mb-4">
          {erro}
        </p>
      )}

      {!erro && pedidos.length === 0 && (
        <Superficie sombra espacamento="amplo" className="text-center">
          <p className="text-texto-secundario mb-4">
            Você ainda não realizou nenhum pedido.
          </p>

          <Botao variante="secundario" para="/">
            Ver produtos
          </Botao>
        </Superficie>
      )}

      <div className="space-y-4">
        {pedidos.map((pedido) => {
          return (
            <Superficie
              as="article"
              key={pedido.id}
              sombra
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-semibold text-lg">
                    Pedido #{pedido.numero_cliente}
                  </h2>

                  <p className="text-sm text-texto-secundario">
                    Realizado em{' '}
                    {new Date(pedido.criado_em).toLocaleString('pt-BR')}
                  </p>
                </div>

                <SeloStatus status={pedido.payment_status} className="self-start">
                  {ROTULOS_PAGAMENTO_CLIENTE[pedido.payment_status] || pedido.payment_status}
                </SeloStatus>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm text-texto-secundario">Valor total</p>

                  <Preco valor={pedido.total} as="p" className="font-bold text-lg" />

                  {pedido.codigo_rastreio && (
                    <p className="mt-2 text-sm text-texto-secundario">
                      Rastreio: {pedido.codigo_rastreio}
                    </p>
                  )}
                </div>

                <Botao
                  variante="secundario"
                  tamanho="sm"
                  para={`/minha-conta/pedidos/${pedido.id}`}
                  aria-label={`Ver detalhes do pedido #${pedido.numero_cliente}`}
                >
                  Ver detalhes
                </Botao>
              </div>
            </Superficie>
          );
        })}
      </div>
    </div>
  );
}
