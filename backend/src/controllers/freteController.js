const melhorEnvioService = require('../services/melhorEnvioService');

async function cotar(req, res) {
  try {
    const { cep_destino, itens, servico_id } = req.body;

    if (!cep_destino) {
      return res.status(400).json({ mensagem: 'CEP de destino é obrigatório' });
    }

    if (!Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({ mensagem: 'Itens do frete não informados' });
    }

    const resultado = await melhorEnvioService.cotar({
      cepDestino: cep_destino,
      itens,
      servicoId: servico_id,
    });

    return res.json(resultado);
  } catch (erro) {
    console.error('Erro ao cotar frete:', erro.message);
    const status = erro.message.includes('inválido') || erro.message.includes('obrigatório') ? 400 : 500;
    return res.status(status).json({ mensagem: erro.message });
  }
}

module.exports = { cotar };