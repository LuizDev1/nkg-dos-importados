const express = require('express');
const router = express.Router();

const controller = require('../controllers/configuracaoController');
const verificarAutenticacao = require('../middlewares/autenticacaoMiddleware');
const verificarAdmin = require('../middlewares/adminMiddleware');

router.get('/configuracoes-loja', controller.buscar);
router.put(
  '/configuracoes-loja',
  verificarAutenticacao,
  verificarAdmin,
  controller.atualizar
);

module.exports = router;