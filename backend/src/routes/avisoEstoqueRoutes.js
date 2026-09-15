const express = require('express');
const controller = require('../controllers/avisoEstoqueController');
const verificarAutenticacao = require('../middlewares/autenticacaoMiddleware');

const router = express.Router();
router.post('/avisos-estoque', verificarAutenticacao, controller.criar);
module.exports = router;
