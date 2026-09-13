const express = require('express');
const router = express.Router();
const pagamentoController = require('../controllers/pagamentoController');

router.post('/pagamentos/webhook', pagamentoController.receberWebhook);
router.post('/pagamentos/:pedidoId', pagamentoController.criarPagamento);

module.exports = router;