const { z } = require('zod'); const Pergunta = require('../models/PerguntaProduto');
const perguntaSchema = z.object({ pergunta: z.string().trim().min(5).max(600) }).strict();
const respostaSchema = z.object({ resposta: z.string().trim().min(2).max(1000) }).strict();
async function listar(req, res) { try { res.json(await Pergunta.listar(req.params.id)); } catch { res.status(500).json({ mensagem: 'Erro ao carregar perguntas' }); } }
async function criar(req, res) { const p = perguntaSchema.safeParse(req.body); if (!p.success) return res.status(400).json({ mensagem: p.error.issues[0].message }); try { res.status(201).json({ id: await Pergunta.criar(req.params.id, req.usuario.id, p.data.pergunta) }); } catch { res.status(500).json({ mensagem: 'Erro ao enviar pergunta' }); } }
async function responder(req, res) { const p = respostaSchema.safeParse(req.body); if (!p.success) return res.status(400).json({ mensagem: p.error.issues[0].message }); try { res.status(await Pergunta.responder(req.params.perguntaId, req.usuario.id, p.data.resposta) ? 200 : 404).json({ mensagem: 'Resposta salva' }); } catch { res.status(500).json({ mensagem: 'Erro ao salvar resposta' }); } }
module.exports = { listar, criar, responder };
