const express = require('express');
const controller = require('../controllers/promocaoController');
const verificarAutenticacao = require('../middlewares/autenticacaoMiddleware');
const verificarAdmin = require('../middlewares/adminMiddleware');
const { schemas, validar } = require('../middlewares/validacao');

const router = express.Router();

router.get('/promocoes', verificarAutenticacao, verificarAdmin, controller.listar);
router.post('/promocoes', verificarAutenticacao, verificarAdmin, validar(schemas.promocao), controller.criar);
router.patch('/promocoes/:id/desativar', verificarAutenticacao, verificarAdmin, controller.desativar);

module.exports = router;