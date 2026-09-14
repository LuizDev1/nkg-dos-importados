const express = require('express');
const router = express.Router();
const autenticacaoController = require('../controllers/autenticacaoController');
const rateLimit = require('express-rate-limit');
const { schemas, validar } = require('../middlewares/validacao');

const limiteAutenticacao = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 10,
	standardHeaders: true,
	legacyHeaders: false,
	message: { mensagem: 'Muitas tentativas. Tente novamente mais tarde.' },
});

router.post('/auth/registrar', limiteAutenticacao, validar(schemas.autenticacao), autenticacaoController.registrar);
router.post('/auth/login', limiteAutenticacao, validar(schemas.login), autenticacaoController.login);

module.exports = router;