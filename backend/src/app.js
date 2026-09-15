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
const promocaoRoutes = require('./routes/promocaoRoutes');
const freteRoutes = require('./routes/freteRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const favoritoRoutes = require('./routes/favoritoRoutes');
const avisoEstoqueRoutes = require('./routes/avisoEstoqueRoutes');
const avaliacaoRoutes = require('./routes/avaliacaoRoutes');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .replace(/\/$/, '');

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim().length < 16) {
  throw new Error('JWT_SECRET deve existir e ter pelo menos 16 caracteres');
}

if (process.env.NODE_ENV === 'production') {
  const obrigatorias = [
    'MERCADOPAGO_ACCESS_TOKEN',
    'MERCADOPAGO_WEBHOOK_SECRET',
    'JWT_ISSUER',
    'JWT_AUDIENCE',
  ];
  const ausentes = obrigatorias.filter((nome) => !process.env[nome]?.trim());

  if (ausentes.length || !frontendUrl.startsWith('https://') || process.env.DB_SSL !== 'true') {
    throw new Error(
      'Configuração de produção inválida: use HTTPS, DB_SSL=true e preencha os segredos obrigatórios'
    );
  }
}

const app = express();
app.use(helmet());
app.set('trust proxy', process.env.TRUST_PROXY === 'true' ? 1 : false);
const limitarApi = process.env.RATE_LIMIT_ENABLED === 'true'
  || (process.env.RATE_LIMIT_ENABLED !== 'false' && process.env.NODE_ENV === 'production');

if (limitarApi) app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.API_RATE_LIMIT || 300),
  standardHeaders: true,
  legacyHeaders: false,
  message: { mensagem: 'Muitas requisições. Tente novamente mais tarde.' },
  skip: (req) => req.path === '/pagamentos/webhook',
}));
app.use(cors({
  origin: frontendUrl,
}));
app.use('/api/pagamentos/webhook', express.raw({ type: 'application/json' }));
app.use('/api/produtos/:produtoId/avaliacoes/minha', require('./middlewares/autenticacaoMiddleware'), express.json({ limit: '8mb' }));
const imagensUpload = require('./routes/imagemRoutes');
app.use('/api', imagensUpload.router);
app.use('/api/uploads', express.static(imagensUpload.pasta, { setHeaders: res => res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin') }));
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || '100kb' }));

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
app.use('/api', promocaoRoutes);
app.use('/api', freteRoutes);
app.use('/api', bannerRoutes);
app.use('/api', favoritoRoutes);
app.use('/api', avisoEstoqueRoutes);
app.use('/api', avaliacaoRoutes);

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

module.exports = app;
