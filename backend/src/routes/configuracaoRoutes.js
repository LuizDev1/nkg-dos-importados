const express = require('express');
const router = express.Router();

const controller = require('../controllers/configuracaoController');
const verificarAutenticacao = require('../middlewares/autenticacaoMiddleware');
const verificarAdmin = require('../middlewares/adminMiddleware');
const { schemas, validar } = require('../middlewares/validacao');

router.get('/configuracoes-loja', controller.buscar);
router.put(
  '/configuracoes-loja',
  verificarAutenticacao,
  verificarAdmin,
  validar(schemas.configuracaoLoja),
  controller.atualizar
);

module.exports = router;
