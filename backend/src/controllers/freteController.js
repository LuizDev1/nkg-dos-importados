const melhorEnvioService = require('../services/melhorEnvioService');

async function cotar(req, res) {
  try {
    const resultado = await melhorEnvioService.cotar({
      cepDestino: req.body.cep_destino,
      itens: req.body.itens,
      servicoId: req.body.servico_id,
    });
    return res.json(resultado);
  } catch (erro) {
    console.error('Erro ao calcular frete:', erro.message);
    return res.status(502).json({ mensagem: erro.message });
  }
}

module.exports = { cotar };