const express = require('express');
const controller = require('../controllers/bannerController');
const verificarAutenticacao = require('../middlewares/autenticacaoMiddleware');
const verificarAdmin = require('../middlewares/adminMiddleware');
const { schemas, validar } = require('../middlewares/validacao');

const router = express.Router();

router.get('/banners', controller.listarPublico);
router.get('/banners/admin', verificarAutenticacao, verificarAdmin, controller.listarAdmin);
router.post('/banners', verificarAutenticacao, verificarAdmin, validar(schemas.banner), controller.criar);
router.put('/banners/:id', verificarAutenticacao, verificarAdmin, validar(schemas.banner), controller.atualizar);
router.delete('/banners/:id', verificarAutenticacao, verificarAdmin, controller.remover);

module.exports = router;
