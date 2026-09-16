export function limitarQuantidade(quantidade, estoque) {
  if (!Number.isInteger(quantidade) || quantidade < 1 || !Number.isFinite(estoque) || estoque < 0) return null;
  return Math.min(quantidade, estoque);
}

export function estoqueDoItem(produto, item) {
  if (produto.ativo === false || Number(produto.ativo) === 0) return 0;
  const variacao = item.variacao_id == null ? null : (produto.variacoes || []).find(v => String(v.id) === String(item.variacao_id));
  if (item.variacao_id != null && !variacao) return 0;
  return Math.max(0, Math.trunc(Number(variacao ? variacao.estoque_qtd : produto.estoque_qtd) || 0));
}

export function atualizarEstoqueCarrinho(itens, produtos) {
  return itens.flatMap(item => {
    const produto = produtos.get(String(item.produto_id));
    if (!produto) return [item];
    const estoque_qtd = estoqueDoItem(produto, item);
    if (estoque_qtd === 0) return [];
    return [{ ...item, estoque_qtd, quantidade: Math.min(Math.max(1, Math.trunc(Number(item.quantidade) || 1)), estoque_qtd) }];
  });
}
