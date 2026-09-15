export default function ItemCarrinho({ item, onAlterarQuantidade, onRemover, carregandoEstoque = false }) {
  function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  return (
    <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow">
      <img
        src={item.foto_url || 'https://placehold.co/80'}
        alt={item.nome}
        className="w-16 h-16 object-cover rounded"
      />
      <div className="flex-1">
        <p className="font-semibold">{item.nome}</p>
        {item.variacao_nome && <p className="text-sm text-gray-500">{item.variacao_nome}</p>}
        <p className="text-sm text-gray-500">{formatarMoeda(item.preco)}</p>
      </div>
      <label className="text-xs text-[#aaa399]">
        Quantidade
      <input
        type="number"
        min="1"
        max={item.estoque_qtd}
        step="1"
        disabled={carregandoEstoque || !item.estoque_qtd}
        value={item.quantidade}
        onChange={(e) => onAlterarQuantidade(item.chave, Number(e.target.value))}
        className="mt-2 block w-20 border rounded px-2 py-1 text-center"
      />
      </label>
      <button onClick={() => onRemover(item.chave)} className="text-red-600 hover:underline text-sm">
        Remover
      </button>
    </div>
  );
}
