const express = require('express');
const router = express.Router();
const autenticacaoController = require('../controllers/autenticacaoController');
const rateLimit = require('express-rate-limit');

const limiteAutenticacao = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 10,
	standardHeaders: true,
	legacyHeaders: false,
	message: { mensagem: 'Muitas tentativas. Tente novamente mais tarde.' },
});

router.post('/auth/registrar', limiteAutenticacao, autenticacaoController.registrar);
router.post('/auth/login', limiteAutenticacao, autenticacaoController.login);

module.exports = router;