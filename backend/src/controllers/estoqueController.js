const Estoque = require('../models/MovimentacaoEstoque');
async function baixo(req, res) { try { res.json(await Estoque.listarBaixo()); } catch { res.status(500).json({ mensagem: 'Erro ao carregar estoque baixo' }); } }
async function historico(req, res) { try { res.json(await Estoque.listar(req.params.id)); } catch { res.status(500).json({ mensagem: 'Erro ao carregar movimentações' }); } }
module.exports = { baixo, historico };
