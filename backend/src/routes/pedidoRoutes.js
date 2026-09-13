const express = require('express');
const pedidoController = require('../controllers/pedidoController');

const router = express.Router();

router.get('/pedidos', pedidoController.listar);

router.get(
  '/pedidos/usuario/:usuarioId',
  pedidoController.listarPorUsuario
);

router.get('/pedidos/:id', pedidoController.buscar);
router.post('/pedidos', pedidoController.criar);
router.patch('/pedidos/:id/status', pedidoController.atualizarStatus
);

module.exports = router;