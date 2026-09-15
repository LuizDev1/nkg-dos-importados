const express = require('express');
const path = require('path');
const fs = require('fs/promises');
const { randomUUID } = require('crypto');
const autenticar = require('../middlewares/autenticacaoMiddleware');
const admin = require('../middlewares/adminMiddleware');
const router = express.Router();
const pasta = path.join(__dirname, '../../uploads');
router.post('/imagens', autenticar, admin, express.raw({ type: ['image/jpeg', 'image/png', 'image/webp'], limit: '1mb' }), async (req, res) => {
  const bytes = req.body;
  if (!Buffer.isBuffer(bytes)) return res.status(400).json({ mensagem: 'Use JPG, PNG ou WebP' });
  const tipo = req.get('Content-Type');
  let extensao;
  if (tipo === 'image/png' && bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) extensao = 'png';
  if (tipo === 'image/jpeg' && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) extensao = 'jpg';
  if (tipo === 'image/webp' && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') extensao = 'webp';
  if (!extensao) return res.status(400).json({ mensagem: 'Foto inválida' });
  try {
    await fs.mkdir(pasta, { recursive: true });
    const nome = randomUUID() + '.' + extensao;
    await fs.writeFile(path.join(pasta, nome), bytes, { flag: 'wx' });
    return res.status(201).json({ imagem_url: '/api/media/' + nome });
  } catch {
    return res.status(500).json({ mensagem: 'Erro ao salvar foto' });
  }
});
module.exports = { router, pasta };
