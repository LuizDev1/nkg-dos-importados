import { ROTULOS_PAGAMENTO_CLIENTE, ROTULOS_PEDIDO } from '../../servicos/statusVisual';
import Botao from '../../componentes/ui/Botao';
import Preco from '../../componentes/ui/Preco';
import SeloStatus from '../../componentes/ui/SeloStatus';
import Superficie from '../../componentes/ui/Superficie';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { buscarMeuPedido } from '../../servicos/pedidoService';

const ETAPAS_ENTREGA = [
  ['pago', 'Pagamento aprovado'],
  ['em_preparacao', 'Em preparação'],
  ['enviado', 'Enviado'],
  ['entregue', 'Entregue'],
];

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
        <p className="text-erro mb-4">
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

          <p className="text-sm text-texto-secundario">
            Realizado em{' '}
            {new Date(pedido.criado_em).toLocaleString('pt-BR')}
          </p>
        </div>

        <SeloStatus status={pedido.payment_status} className="self-start">
          {ROTULOS_PAGAMENTO_CLIENTE[pedido.payment_status] || pedido.payment_status}
        </SeloStatus>
      </div>

      {!['cancelado', 'reembolso_pendente', 'reembolsado'].includes(pedido.status_pedido) && (
        <Superficie as="section" sombra className="mb-6" aria-label="Andamento do pedido">
          <h2 className="mb-5 text-lg font-semibold">Andamento do pedido</h2>
          <ol className="grid grid-cols-2 gap-y-5 sm:grid-cols-4">
            {ETAPAS_ENTREGA.map(([chave, titulo], indice) => {
              const concluida = etapaAtual >= indice;
              const atual = etapaAtual === indice;
              return <li key={chave} className="flex items-center gap-2 pr-2 text-sm">
                <span aria-hidden="true" className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${concluida ? 'bg-marca text-texto-inverso' : 'bg-superficie-destaque text-texto-secundario'}`}>{concluida ? '✓' : indice + 1}</span>
                <span className={atual ? 'font-semibold text-marca' : concluida ? 'text-texto' : 'text-texto-secundario'}>{titulo}</span>
              </li>;
            })}
          </ol>
        </Superficie>
      )}

      <Superficie as="section" sombra className="mb-6">
        <h2 className="text-lg font-semibold mb-4">
          Informações da entrega
        </h2>

        <div className="space-y-2 text-sm">
          <p>
            <strong>Status do pedido:</strong>{' '}
            {pedido.status_pedido
              ? <SeloStatus status={pedido.status_pedido}>{ROTULOS_PEDIDO[pedido.status_pedido] || pedido.status_pedido}</SeloStatus>
              : 'Ainda não disponível'}
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
            {rastreioUrl ? <a href={rastreioUrl} target="_blank" rel="noreferrer" className="font-medium text-link underline hover:text-acao-hover">{pedido.codigo_rastreio} (acompanhar entrega)</a> : 'Ainda não disponível'}
          </p>
        </div>
      </Superficie>

      <Superficie as="section" sombra espacamento="nenhum" className="overflow-hidden mb-6">
        <h2 className="text-lg font-semibold p-5">
          Produtos comprados
        </h2>

        {pedido.status_pedido === 'entregue' && (
          <div className="mx-5 mb-5 rounded-cartao border border-marca-borda bg-marca-suave p-4">
            <p className="font-semibold text-marca">Seu pedido foi entregue. Conte como foi sua experiência.</p>
            <p className="mt-1 text-sm text-texto-secundario">Você pode avaliar cada produto comprado uma vez.</p>
          </div>
        )}

        <div className="divide-y divide-divisor">
          {(pedido.itens || []).map((item) => (
            <div
              key={item.id}
              className="p-5 flex flex-col gap-4 sm:flex-row"
            >
              {item.foto_url ? (
                <img src={item.foto_url} alt={item.produto_nome} className="w-24 h-24 rounded object-cover" />
              ) : (
                <div role="img" aria-label={`Imagem indisponível de ${item.produto_nome}`} className="flex h-24 w-24 shrink-0 items-center justify-center rounded-controle bg-superficie-destaque text-center text-legenda text-texto-secundario">Sem imagem</div>
              )}

              <div className="flex-1">
                <Link
                  to={`/produto/${item.produto_id}`}
                  className="font-semibold hover:text-marca"
                >
                  {item.produto_nome}
                </Link>

                <p className="text-sm text-texto-secundario mt-1">
                  Quantidade: {item.quantidade}
                </p>

                {item.variacao_nome && (
                  <p className="text-sm text-texto-secundario">Variação: {item.variacao_nome}</p>
                )}

                <p className="text-sm text-texto-secundario">
                  Preço unitário: <Preco valor={item.preco_unitario} />
                </p>

                {pedido.status_pedido === 'entregue' && (
                  <Botao variante="secundario" tamanho="sm" para={`/produto/${item.produto_id}#avaliacoes`} className="mt-3">
                    Avaliar produto
                  </Botao>
                )}
              </div>

              <div>
                <p className="text-sm text-texto-secundario">
                  Subtotal
                </p>

                <Preco valor={Number(item.preco_unitario) * item.quantidade} as="p" className="font-semibold" />
              </div>
            </div>
          ))}
        </div>
      </Superficie>

      <Superficie as="section" sombra className="space-y-3">
        <div className="flex justify-between">
          <span>Subtotal dos produtos</span>
          <Preco valor={pedido.subtotal ?? Number(pedido.total) - Number(pedido.frete || 0) + Number(pedido.desconto || 0)} />
        </div>

        <div className="flex justify-between">
          <span>Frete</span>
          <Preco valor={pedido.frete || 0} />
        </div>

        <div className="flex justify-between">
          <span>Desconto</span>
          <span className="tabular-nums">{Number(pedido.desconto || 0) > 0 ? '- ' : ''}<Preco valor={pedido.desconto || 0} /></span>
        </div>

        <div className="border-t border-divisor pt-3 flex justify-between">
          <span className="font-semibold">Total do pedido</span>
          <Preco valor={pedido.total} className="text-xl font-bold" />
        </div>
      </Superficie>
    </div>
  );
}
