const express = require('express');
const router = express.Router();
const pagamentoController = require('../controllers/pagamentoController');
const verificarAutenticacao = require('../middlewares/autenticacaoMiddleware');

router.post('/pagamentos/webhook', pagamentoController.receberWebhook);
router.post(
	'/pagamentos/:pedidoId',
	verificarAutenticacao,
	pagamentoController.criarPagamento
);
router.post(
  '/pagamentos/:pedidoId/sincronizar',
  verificarAutenticacao,
  pagamentoController.sincronizarPagamento
);

module.exports = router;