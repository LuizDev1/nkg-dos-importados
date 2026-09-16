const { z } = require('zod');
const Endereco = require('../models/Endereco');

const schema = z.object({
  apelido: z.string().trim().min(1).max(60),
  cep: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
  rua: z.string().trim().min(2).max(160), numero: z.string().trim().min(1).max(20),
  complemento: z.string().trim().max(100).optional().default(''), bairro: z.string().trim().min(2).max(100),
  cidade: z.string().trim().min(2).max(100), estado: z.string().trim().regex(/^[a-zA-Z]{2}$/, 'Use a sigla do estado'),
  telefone: z.string().trim().max(20).optional().default(''), principal: z.boolean().optional().default(false),
}).strict();

async function listar(req, res) { try { res.json(await Endereco.listar(req.usuario.id)); } catch { res.status(500).json({ mensagem: 'Erro ao listar endereços' }); } }
async function criar(req, res) {
  const resultado = schema.safeParse(req.body);
  if (!resultado.success) return res.status(400).json({ mensagem: resultado.error.issues[0].message });
  try { res.status(201).json({ id: await Endereco.criar(req.usuario.id, resultado.data) }); } catch { res.status(500).json({ mensagem: 'Erro ao salvar endereço' }); }
}
async function remover(req, res) { try { res.status(await Endereco.remover(req.usuario.id, req.params.id) ? 200 : 404).json({ mensagem: 'Endereço removido' }); } catch { res.status(500).json({ mensagem: 'Erro ao remover endereço' }); } }
async function definirPrincipal(req, res) { try { res.status(await Endereco.definirPrincipal(req.usuario.id, req.params.id) ? 200 : 404).json({ mensagem: 'Endereço principal atualizado' }); } catch { res.status(500).json({ mensagem: 'Erro ao atualizar endereço' }); } }
module.exports = { listar, criar, remover, definirPrincipal };
