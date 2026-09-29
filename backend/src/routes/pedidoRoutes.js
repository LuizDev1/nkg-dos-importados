const express = require('express');
const pedidoController = require('../controllers/pedidoController');
const verificarAutenticacao = require('../middlewares/autenticacaoMiddleware');
const verificarAdmin = require('../middlewares/adminMiddleware');
const { schemas, validar, validarIds } = require('../middlewares/validacao');

const router = express.Router();

router.get('/pedidos', verificarAutenticacao, verificarAdmin, pedidoController.listar);
router.get('/pedidos/me', verificarAutenticacao, pedidoController.listarMeusPedidos);
router.get('/pedidos/me/:id', verificarAutenticacao, validarIds('id'), pedidoController.buscarMeuPedido);
router.get('/pedidos/usuario/:usuarioId', verificarAutenticacao, verificarAdmin, validarIds('usuarioId'), pedidoController.listarPorUsuario);
router.get('/pedidos/:id', verificarAutenticacao, validarIds('id'), pedidoController.buscar);
router.post('/pedidos', verificarAutenticacao, validar(schemas.pedido), pedidoController.criar);
router.patch('/pedidos/:id/status-operacional', verificarAutenticacao, verificarAdmin, validarIds('id'), validar(schemas.statusPedido), pedidoController.atualizarStatusOperacional);
router.patch('/pedidos/:id/cancelar', verificarAutenticacao, validarIds('id'), pedidoController.cancelar);
router.patch('/pedidos/:id/abandonar', verificarAutenticacao, validarIds('id'), pedidoController.abandonar);
router.patch(
  '/pedidos/:id/rastreio',
  verificarAutenticacao,
  verificarAdmin,
  validarIds('id'),
  validar(schemas.rastreio),
  pedidoController.atualizarRastreio
);

module.exports = router;
