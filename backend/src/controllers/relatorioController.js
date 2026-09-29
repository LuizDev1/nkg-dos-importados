const Pedido = require('../models/Pedido');

async function mensal(req, res) {
  try {
    const dados = await Pedido.relatorioMensal();

    const totalVendido = Number(dados.total_vendido);
    const quantidadePedidos = Number(dados.quantidade_pedidos);
    const ticketMedio = quantidadePedidos > 0 ? totalVendido / quantidadePedidos : 0;

    res.json({
      total_vendido: totalVendido,
      quantidade_pedidos: quantidadePedidos,
      ticket_medio: ticketMedio,
    });
  } catch (erro) {
    console.error('Erro ao gerar relatório:', erro);
    res.status(500).json({ mensagem: 'Erro ao gerar relatório' });
  }
}

module.exports = { mensal };
