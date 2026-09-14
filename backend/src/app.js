const express = require('express');
require('dotenv').config();
const pool = require('./config/banco');
const produtoRoutes = require('./routes/produtoRoutes');
const autenticacaoRoutes = require('./routes/autenticacaoRoutes');
const pedidoRoutes = require('./routes/pedidoRoutes');
const pagamentoRoutes = require('./routes/pagamentoRoutes');
const relatorioRoutes = require('./routes/relatorioRoutes');
const configuracaoRoutes = require('./routes/configuracaoRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const cors = require('cors');
const helmet = require('helmet');

const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .replace(/\/$/, '');

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim().length < 16) {
  throw new Error('JWT_SECRET deve existir e ter pelo menos 16 caracteres');
}

const app = express();
app.use(helmet());
app.use(cors({
  origin: frontendUrl,
}));
app.use('/api/pagamentos/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', banco: 'ok' });
  } catch (erro) {
    console.error('Health check do banco falhou:', erro.message);
    res.status(503).json({ status: 'degradado', banco: 'indisponivel' });
  }
});

app.use('/api', produtoRoutes);
app.use('/api', autenticacaoRoutes);
app.use('/api', pedidoRoutes);
app.use('/api', pagamentoRoutes);
app.use('/api', relatorioRoutes);
app.use('/api', configuracaoRoutes);
app.use('/api', usuarioRoutes);

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

module.exports = app;