const express = require('express');
const router = express.Router();
const produtoController = require('../controllers/produtoController');
const verificarAutenticacao = require('../middlewares/autenticacaoMiddleware');
const verificarAdmin = require('../middlewares/adminMiddleware');

router.get('/produtos', produtoController.listarPublico);
router.get('/produtos/:id', produtoController.buscar);
router.get('/produtos/admin', verificarAutenticacao, verificarAdmin, produtoController.listarAdmin);
router.post('/produtos', verificarAutenticacao, verificarAdmin, produtoController.criar);
router.put('/produtos/:id', verificarAutenticacao, verificarAdmin, produtoController.atualizar);
router.patch('/produtos/:id/remover', verificarAutenticacao, verificarAdmin, produtoController.remover);
router.patch('/produtos/:id/reativar', verificarAutenticacao, verificarAdmin, produtoController.reativar);

module.exports = router;