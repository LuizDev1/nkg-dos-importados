const express = require('express');
const freteController = require('../controllers/freteController');
const verificarAutenticacao = require('../middlewares/autenticacaoMiddleware');
const { schemas, validar } = require('../middlewares/validacao');

const router = express.Router();
router.post('/fretes/cotacao', verificarAutenticacao, validar(schemas.freteCotacao), freteController.cotar);

module.exports = router;