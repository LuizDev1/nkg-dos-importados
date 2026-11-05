import { Link } from 'react-router-dom';

export default function ItemCarrinho({ item, onAlterarQuantidade, onRemover, carregandoEstoque = false }) {
  function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  return (
    <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-lg shadow">
      {item.foto_url ? (
        <img src={item.foto_url} alt={item.nome} className="w-16 h-16 shrink-0 object-cover rounded" />
      ) : (
        <div role="img" aria-label={`Imagem indisponível de ${item.nome}`} className="flex h-16 w-16 shrink-0 items-center justify-center rounded bg-gray-200 text-center text-xs text-gray-500">Sem imagem</div>
      )}
      <div className="min-w-0 flex-1 basis-40">
        <Link
          to={`/produto/${item.produto_id}`}
          className="font-semibold hover:text-[#d4af45] hover:underline"
        >
          {item.nome}
        </Link>
        {item.variacao_nome && <p className="text-sm text-gray-500">{item.variacao_nome}</p>}
        <p className="text-sm text-gray-500">{formatarMoeda(item.preco)}</p>
      </div>
      <div className="flex items-end gap-4">
        <label className="text-xs text-[#aaa399]">
          Quantidade
        <input
          type="number"
          name={`quantidade-${item.chave}`}
          inputMode="numeric"
          min="1"
          max={item.estoque_qtd}
          step="1"
          disabled={carregandoEstoque || !item.estoque_qtd}
          value={item.quantidade}
          onChange={(e) => onAlterarQuantidade(item.chave, Number(e.target.value))}
          className="mt-2 block w-20 border rounded px-2 py-1 text-center text-base"
        />
        </label>
        <button type="button" onClick={() => onRemover(item.chave)} aria-label={`Remover ${item.nome}${item.variacao_nome ? ` (${item.variacao_nome})` : ''}`} className="pb-1 text-erro hover:underline text-sm">
          Remover
        </button>
      </div>
    </div>
  );
}
