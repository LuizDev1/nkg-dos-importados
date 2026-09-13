const express = require('express');
const router = express.Router();
const pagamentoController = require('../controllers/pagamentoController');

router.post('/pagamentos/:pedidoId', pagamentoController.criarPagamento);
router.post('/pagamentos/webhook', pagamentoController.receberWebhook);

module.exports = router;