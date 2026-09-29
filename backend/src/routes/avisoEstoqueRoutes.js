const express = require('express');
const controller = require('../controllers/avisoEstoqueController');
const verificarAutenticacao = require('../middlewares/autenticacaoMiddleware');
const { schemas, validar } = require('../middlewares/validacao');

const router = express.Router();
router.post('/avisos-estoque', verificarAutenticacao, validar(schemas.avisoEstoque), controller.criar);
module.exports = router;
