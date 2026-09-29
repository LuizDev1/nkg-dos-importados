const express = require('express');
const controller = require('../controllers/avaliacaoController');
const verificarAutenticacao = require('../middlewares/autenticacaoMiddleware');
const { schemas, validar, validarIds } = require('../middlewares/validacao');

const router = express.Router();
router.get('/produtos/:produtoId/avaliacoes', validarIds('produtoId'), controller.listar);
router.get('/produtos/:produtoId/avaliacoes/permissao', verificarAutenticacao, validarIds('produtoId'), controller.verificarPermissao);
router.put('/produtos/:produtoId/avaliacoes/minha', verificarAutenticacao, validarIds('produtoId'), validar(schemas.avaliacao), controller.salvar);
router.put('/avaliacoes/:avaliacaoId/util', verificarAutenticacao, validarIds('avaliacaoId'), controller.marcarUtil);
router.delete('/avaliacoes/:avaliacaoId/util', verificarAutenticacao, validarIds('avaliacaoId'), controller.marcarUtil);
router.get('/produtos/:produtoId/avaliacoes/meus-votos', verificarAutenticacao, validarIds('produtoId'), controller.listarVotos);
module.exports = router;
