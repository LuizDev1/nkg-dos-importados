const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

router.patch('/usuarios/:id/cpf', usuarioController.atualizarCpf);

module.exports = router;