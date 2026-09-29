const express = require('express');
const router = express.Router();
const pagamentoController = require('../controllers/pagamentoController');
const verificarAutenticacao = require('../middlewares/autenticacaoMiddleware');
const { schemas, validar, validarIds, validarQuery } = require('../middlewares/validacao');

router.post('/pagamentos/webhook', pagamentoController.receberWebhook);
router.post(
	'/pagamentos/:pedidoId',
	verificarAutenticacao,
	validarIds('pedidoId'),
	pagamentoController.criarPagamento
);
router.post(
  '/pagamentos/:pedidoId/sincronizar',
  verificarAutenticacao,
  validarIds('pedidoId'),
  validar(schemas.sincronizacaoPagamento),
  validarQuery(schemas.sincronizacaoPagamento),
  pagamentoController.sincronizarPagamento
);

module.exports = router;
