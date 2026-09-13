const express = require('express');
const router = express.Router();
const autenticacaoController = require('../controllers/autenticacaoController');

router.post ('/auth/registrar', autenticacaoController.registrar);
router.post ('/auth/login', autenticacaoController.login);

module.exports = router;