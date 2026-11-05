import { corStatus } from '../../servicos/statusVisual';
import { useEffect, useState } from 'react';
import { avisarAdmin } from '../../utilitarios/avisoAdmin';
import { Link, useParams } from 'react-router-dom';
import TabelaRolavel from '../../componentes/TabelaRolavel';
import {
  buscarPedido,
  atualizarCodigoRastreio,
} from '../../servicos/pedidoService';

export default function DetalhePedido() {
  const { id } = useParams();
  const [pedido, setPedido] = useState(null);
  const [codigoRastreio, setCodigoRastreio] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    buscarPedido(id)
      .then((dados) => {
        setPedido(dados);
        setCodigoRastreio(dados.codigo_rastreio || '');
      })
      .catch((erro) => setErro(erro.message))
      .finally(() => setCarregando(false));
  }, [id]);

  async function salvarRastreio(evento) {
    evento.preventDefault();
    setMensagem('');
    setErro('');
    setSalvando(true);

    try {
      await atualizarCodigoRastreio(id, codigoRastreio);

      setPedido((anterior) => ({
        ...anterior,
        codigo_rastreio: codigoRastreio,
      }));

      avisarAdmin('Código de rastreio salvo com sucesso.');
    } catch (erro) {
      setErro(erro.message);
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return <p className="text-center mt-10">Carregando pedido...</p>;
  }

  if (erro && !pedido) {
    return <p className="text-center mt-10 text-erro">{erro}</p>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link
        to={`/admin/clientes/${pedido.usuario_id}`}
        className="botao-voltar"
      >
        &larr; Voltar para o cliente
      </Link>

      <h1 className="text-2xl font-bold mt-2 mb-6">
        Pedido #{pedido.numero_cliente} de {pedido.usuario_nome}
      </h1>
      <p className="-mt-4 mb-6 text-sm text-texto-secundario">ID interno: {pedido.id}</p>

      <div className="bg-white rounded-lg shadow p-5 mb-6 space-y-1">
        <p><strong>Cliente:</strong> {pedido.usuario_nome}</p>
        <p><strong>E-mail:</strong> {pedido.usuario_email}</p>
        <p><strong>Status:</strong>{' '}
          <span className={corStatus(pedido.payment_status)}>
            {pedido.payment_status}
          </span>
        </p>
        <p><strong>Entrega:</strong> {pedido.tipo_entrega}</p>
        <p><strong>Endereço:</strong> {pedido.endereco_entrega}</p>
        <p><strong>Telefone:</strong> {pedido.telefone_contato}</p>
        <p><strong>Pagamento:</strong> {pedido.payment_id || 'Não informado'}</p>
        <p><strong>Rastreio:</strong> {pedido.codigo_rastreio || 'Não informado'}</p>
      </div>

      <form
        onSubmit={salvarRastreio}
        className="bg-white rounded-lg shadow p-5 mb-6"
      >
        <h2 className="text-xl font-semibold mb-3">
          <label htmlFor="codigo-rastreio">Código de rastreio</label>
        </h2>

        <div className="flex flex-wrap gap-2">
          <input
            id="codigo-rastreio"
            name="codigo_rastreio"
            autoComplete="off"
            value={codigoRastreio}
            onChange={(evento) => setCodigoRastreio(evento.target.value)}
            placeholder="Ex.: BR123456789BR"
            className="border rounded px-3 py-2 flex-1 min-w-0 basis-48"
          />

          <button
            type="submit"
            disabled={salvando}
            className="bg-black text-white rounded px-4 disabled:opacity-50"
          >
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>

        {mensagem && <p className="text-sucesso mt-2">{mensagem}</p>}
        {erro && <p className="text-erro mt-2">{erro}</p>}
      </form>

      <h2 className="text-xl font-semibold mb-3">Produtos do pedido</h2>

      <TabelaRolavel rotulo="Produtos do pedido" className="bg-white rounded-lg shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Produto</th>
              <th className="p-3">Quantidade</th>
              <th className="p-3">Preço unitário</th>
              <th className="p-3">Subtotal</th>
            </tr>
          </thead>

          <tbody>
            {pedido.itens.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-3">{item.produto_nome}</td>
                <td className="p-3">{item.quantidade}</td>
                <td className="p-3">
                  {Number(item.preco_unitario).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </td>
                <td className="p-3">
                  {(item.quantidade * Number(item.preco_unitario)).toLocaleString(
                    'pt-BR',
                    {
                      style: 'currency',
                      currency: 'BRL',
                    }
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TabelaRolavel>
    </div>
  );
}
