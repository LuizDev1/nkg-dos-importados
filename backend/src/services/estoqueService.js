const Produto = require('../models/Produto');

async function baixarEstoque(itens, conexao) {
  for (const item of itens) {
    const alterado = await Produto.diminuirEstoque(
      item.produto_id,
      item.quantidade,
      conexao
    );

    if (!alterado) {
      throw new Error(`Estoque insuficiente para o produto ${item.produto_id}`);
    }
  }
}

module.exports = { baixarEstoque };