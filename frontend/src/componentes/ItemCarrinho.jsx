export default function ItemCarrinho({ item, onAlterarQuantidade, onRemover }) {
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
        <p className="text-sm text-gray-500">{formatarMoeda(item.preco)}</p>
      </div>
      <input
        type="number"
        min="1"
        value={item.quantidade}
        onChange={(e) => onAlterarQuantidade(item.produto_id, Number(e.target.value))}
        className="w-16 border rounded px-2 py-1 text-center"
      />
      <button onClick={() => onRemover(item.produto_id)} className="text-red-600 hover:underline text-sm">
        Remover
      </button>
    </div>
  );
}
