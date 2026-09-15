const express = require('express');
const controller = require('../controllers/avaliacaoController');
const verificarAutenticacao = require('../middlewares/autenticacaoMiddleware');
const { schemas, validar } = require('../middlewares/validacao');

const router = express.Router();
router.get('/produtos/:produtoId/avaliacoes', controller.listar);
router.get('/produtos/:produtoId/avaliacoes/permissao', verificarAutenticacao, controller.verificarPermissao);
router.put('/produtos/:produtoId/avaliacoes/minha', verificarAutenticacao, validar(schemas.avaliacao), controller.salvar);
router.put('/avaliacoes/:avaliacaoId/util', verificarAutenticacao, controller.marcarUtil);
router.delete('/avaliacoes/:avaliacaoId/util', verificarAutenticacao, controller.marcarUtil);
router.get('/produtos/:produtoId/avaliacoes/meus-votos', verificarAutenticacao, controller.listarVotos);
module.exports = router;
