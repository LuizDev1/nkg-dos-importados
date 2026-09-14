const express = require('express');
const router = express.Router();
const produtoController = require('../controllers/produtoController');
const verificarAutenticacao = require('../middlewares/autenticacaoMiddleware');
const verificarAdmin = require('../middlewares/adminMiddleware');
const { schemas, validar } = require('../middlewares/validacao');

router.get('/produtos', produtoController.listarPublico);
router.get('/produtos/admin', verificarAutenticacao, verificarAdmin, produtoController.listarAdmin);
router.get('/produtos/:id', produtoController.buscar);
router.post('/produtos', verificarAutenticacao, verificarAdmin, validar(schemas.produto), produtoController.criar);
router.put('/produtos/:id', verificarAutenticacao, verificarAdmin, validar(schemas.produto), produtoController.atualizar);
router.patch('/produtos/:id/remover', verificarAutenticacao, verificarAdmin, produtoController.remover);
router.patch('/produtos/:id/reativar', verificarAutenticacao, verificarAdmin, produtoController.reativar);

module.exports = router;