const express = require('express');
const router = express.Router();

const usuarioController = require('../controllers/usuarioController');
const verificarAutenticacao = require('../middlewares/autenticacaoMiddleware');
const verificarAdmin = require('../middlewares/adminMiddleware');
const enderecoController = require('../controllers/enderecoController');
const { schemas, validar, validarIds, validarQuery } = require('../middlewares/validacao');
router.get('/usuarios/me/enderecos', verificarAutenticacao, enderecoController.listar);
router.post('/usuarios/me/enderecos', verificarAutenticacao, enderecoController.criar);
router.delete('/usuarios/me/enderecos/:id', verificarAutenticacao, validarIds('id'), enderecoController.remover);
router.patch('/usuarios/me/enderecos/:id/principal', verificarAutenticacao, validarIds('id'), enderecoController.definirPrincipal);
router.get('/usuarios/me', verificarAutenticacao, usuarioController.buscarConta);
router.patch('/usuarios/me', verificarAutenticacao, usuarioController.editarConta);
router.patch('/usuarios/:id/dados', verificarAutenticacao, verificarAdmin, validarIds('id'), usuarioController.editarConta);

router.get(
  '/usuarios/clientes',
  verificarAutenticacao,
  verificarAdmin,
  validarQuery(schemas.buscaClientes),
  usuarioController.listarClientes
);

router.patch(
  '/usuarios/:id/status',
  verificarAutenticacao,
  verificarAdmin,
  validarIds('id'),
  validar(schemas.statusCliente),
  usuarioController.atualizarStatus
);

router.patch(
  '/usuarios/:id/cpf',
  verificarAutenticacao,
  validarIds('id'),
  validar(schemas.cpf),
  usuarioController.atualizarCpf
);

router.get('/meus-dados', verificarAutenticacao, usuarioController.exportarDados);
router.delete('/meus-dados', verificarAutenticacao, usuarioController.anonimizarConta);

module.exports = router;
