const express = require('express');
const controller = require('../controllers/avaliacaoController');
const verificarAutenticacao = require('../middlewares/autenticacaoMiddleware');
const { schemas, validar } = require('../middlewares/validacao');

const router = express.Router();
router.get('/produtos/:produtoId/avaliacoes', controller.listar);
router.get('/produtos/:produtoId/avaliacoes/permissao', verificarAutenticacao, controller.verificarPermissao);
router.put('/produtos/:produtoId/avaliacoes/minha', verificarAutenticacao, validar(schemas.avaliacao), controller.salvar);
module.exports = router;
