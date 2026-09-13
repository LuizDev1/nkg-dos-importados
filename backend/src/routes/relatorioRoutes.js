const express = require('express');
const router = express.Router();
const relatorioController = require('../controllers/relatorioController');
const verificarAutenticacao = require('../middlewares/autenticacaoMiddleware');
const verificarAdmin = require('../middlewares/adminMiddleware');

router.get('/relatorios/mensal', verificarAutenticacao, verificarAdmin, relatorioController.mensal);

module.exports = router;