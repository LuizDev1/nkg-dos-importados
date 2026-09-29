const express = require('express');
const controller = require('../controllers/promocaoController');
const verificarAutenticacao = require('../middlewares/autenticacaoMiddleware');
const verificarAdmin = require('../middlewares/adminMiddleware');
const { schemas, validar, validarIds } = require('../middlewares/validacao');

const router = express.Router();

router.get('/promocoes', verificarAutenticacao, verificarAdmin, controller.listar);
router.post('/promocoes', verificarAutenticacao, verificarAdmin, validar(schemas.promocao), controller.criar);
router.put('/promocoes/:id', verificarAutenticacao, verificarAdmin, validarIds('id'), validar(schemas.promocao), controller.atualizar);
router.patch('/promocoes/:id/desativar', verificarAutenticacao, verificarAdmin, validarIds('id'), controller.desativar);
router.patch('/promocoes/:id/reativar', verificarAutenticacao, verificarAdmin, validarIds('id'), controller.reativar);

module.exports = router;
