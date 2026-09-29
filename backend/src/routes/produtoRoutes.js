const express = require('express');
const router = express.Router();
const produtoController = require('../controllers/produtoController');
const verificarAutenticacao = require('../middlewares/autenticacaoMiddleware');
const verificarAdmin = require('../middlewares/adminMiddleware');
const { schemas, validar, validarIds, validarQuery } = require('../middlewares/validacao');
const perguntaController = require('../controllers/perguntaProdutoController');
const estoqueController = require('../controllers/estoqueController');

router.get('/produtos', validarQuery(schemas.filtrosProduto), produtoController.listarPublico);
router.get('/produtos/categorias', produtoController.listarCategorias);
router.get('/produtos/admin', verificarAutenticacao, verificarAdmin, produtoController.listarAdmin);
router.get('/produtos/estoque-baixo', verificarAutenticacao, verificarAdmin, estoqueController.baixo);
router.get('/produtos/:id/movimentacoes-estoque', verificarAutenticacao, verificarAdmin, validarIds('id'), estoqueController.historico);
router.get('/produtos/:id', validarIds('id'), produtoController.buscar);
router.get('/produtos/:id/perguntas', validarIds('id'), perguntaController.listar);
router.post('/produtos/:id/perguntas', verificarAutenticacao, validarIds('id'), perguntaController.criar);
router.patch('/perguntas/:perguntaId/resposta', verificarAutenticacao, verificarAdmin, validarIds('perguntaId'), perguntaController.responder);
router.get('/produtos/:id/variacoes', verificarAutenticacao, verificarAdmin, validarIds('id'), produtoController.listarVariacoes);
router.post('/produtos/:id/variacoes', verificarAutenticacao, verificarAdmin, validarIds('id'), validar(schemas.variacaoProduto), produtoController.criarVariacao);
router.put('/produtos/:id/variacoes/:variacaoId', verificarAutenticacao, verificarAdmin, validarIds('id', 'variacaoId'), validar(schemas.variacaoProduto), produtoController.atualizarVariacao);
router.delete('/produtos/:id/variacoes/:variacaoId', verificarAutenticacao, verificarAdmin, validarIds('id', 'variacaoId'), produtoController.removerVariacao);
router.post('/produtos', verificarAutenticacao, verificarAdmin, validar(schemas.produto), produtoController.criar);
router.put('/produtos/:id', verificarAutenticacao, verificarAdmin, validarIds('id'), validar(schemas.produto), produtoController.atualizar);
router.patch('/produtos/:id/remover', verificarAutenticacao, verificarAdmin, validarIds('id'), produtoController.remover);
router.patch('/produtos/:id/reativar', verificarAutenticacao, verificarAdmin, validarIds('id'), produtoController.reativar);

module.exports = router;
