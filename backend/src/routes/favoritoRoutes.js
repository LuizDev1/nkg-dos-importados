const express = require('express');
const controller = require('../controllers/favoritoController');
const verificarAutenticacao = require('../middlewares/autenticacaoMiddleware');

const router = express.Router();
router.get('/favoritos', verificarAutenticacao, controller.listar);
router.post('/favoritos/:produtoId', verificarAutenticacao, controller.adicionar);
router.delete('/favoritos/:produtoId', verificarAutenticacao, controller.remover);

module.exports = router;
