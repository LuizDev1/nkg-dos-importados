const express = require('express');
const controller = require('../controllers/favoritoController');
const verificarAutenticacao = require('../middlewares/autenticacaoMiddleware');
const { validarIds } = require('../middlewares/validacao');

const router = express.Router();
router.get('/favoritos', verificarAutenticacao, controller.listar);
router.post('/favoritos/:produtoId', verificarAutenticacao, validarIds('produtoId'), controller.adicionar);
router.delete('/favoritos/:produtoId', verificarAutenticacao, validarIds('produtoId'), controller.remover);

module.exports = router;
