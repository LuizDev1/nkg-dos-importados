const express = require('express');
const router = express.Router();
const produtoController = require('../controllers/produtoController');

router.get('/produtos', produtoController.listarPublico);

router.get('/produtos/admin', produtoController.listarAdmin);

router.get('/produtos/:id', produtoController.buscar);

router.post('/produtos', produtoController.criar);

router.put('/produtos:id', produtoController.atualizar);

router.patch('/produtos:id/remover', produtoController.remover);

router.patch('/produtos:id/reativar', produtoController.reativar);

module.exports = router;
