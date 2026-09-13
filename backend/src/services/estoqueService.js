const Produto = require('../models/Produto');

async function baixarEstoque(itens) {
  for (const item of itens) {
    await Produto.diminuirEstoque(item.produto_id, item.quantidade);
  }
}

module.exports = { baixarEstoque };