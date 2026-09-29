const express = require('express');
const router = express.Router();
const autenticacaoController = require('../controllers/autenticacaoController');
const rateLimit = require('express-rate-limit');
const { schemas, validar } = require('../middlewares/validacao');
const verificarAutenticacao = require('../middlewares/autenticacaoMiddleware');
const { protegerFormulario } = require('../middlewares/turnstile');

const limiteLogin = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 10,
	skipSuccessfulRequests: true,
	standardHeaders: true,
	legacyHeaders: false,
	message: { mensagem: 'Muitas tentativas. Tente novamente mais tarde.' },
});

const limiteCadastro = rateLimit({
	windowMs: 60 * 60 * 1000,
	limit: 5,
	standardHeaders: true,
	legacyHeaders: false,
	message: { mensagem: 'Muitos cadastros neste endereço. Tente novamente mais tarde.' },
});

router.post('/auth/registrar', limiteCadastro, protegerFormulario('cadastro'), validar(schemas.autenticacao), autenticacaoController.registrar);
router.post('/auth/login', limiteLogin, protegerFormulario('login'), validar(schemas.login), autenticacaoController.login);
router.post('/auth/logout', verificarAutenticacao, autenticacaoController.logout);

module.exports = router;
