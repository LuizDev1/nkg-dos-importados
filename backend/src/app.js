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
const apiPublicaUrl = (process.env.PUBLIC_API_URL || '').replace(/\/$/, '');

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim().length < 16) {
  throw new Error('JWT_SECRET deve existir e ter pelo menos 16 caracteres');
}

if (process.env.NODE_ENV === 'production') {
  const obrigatorias = [
    'MERCADOPAGO_ACCESS_TOKEN',
    'MERCADOPAGO_WEBHOOK_SECRET',
    'JWT_ISSUER',
    'JWT_AUDIENCE',
    'DATA_ENCRYPTION_KEY',
    'PUBLIC_API_URL',
    'TURNSTILE_SECRET_KEY',
  ];
  const ausentes = obrigatorias.filter((nome) => !process.env[nome]?.trim());

  if (ausentes.length || !frontendUrl.startsWith('https://') || !apiPublicaUrl.startsWith('https://') || process.env.DB_SSL !== 'true') {
    throw new Error(
      'Configuração de produção inválida: use HTTPS, DB_SSL=true e preencha os segredos obrigatórios'
    );
  }
  require('./utils/criptografia').validarConfiguracao();
  if (['root', 'admin'].includes(String(process.env.DB_USER || '').toLowerCase())) {
    throw new Error('DB_USER deve ser uma conta exclusiva da aplicação, sem privilégios administrativos');
  }
}

const app = express();
app.set('trust proxy', process.env.TRUST_PROXY === 'true' ? 1 : false);
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.secure) return next();
    return res.redirect(308, `${apiPublicaUrl}${req.originalUrl}`);
  });
}
app.use(helmet({
  strictTransportSecurity: { maxAge: 31536000, includeSubDomains: true, preload: true },
}));
app.use((req, res, next) => {
  const jsonOriginal = res.json.bind(res);
  res.json = (conteudo) => {
    if (process.env.NODE_ENV === 'production' && res.statusCode >= 500) {
      return jsonOriginal({ mensagem: 'Erro interno do servidor' });
    }
    return jsonOriginal(conteudo);
  };
  next();
});
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
  credentials: true,
  exposedHeaders: ['X-CSRF-Token'],
}));
app.use('/api/pagamentos/webhook', express.raw({ type: 'application/json' }));
app.use('/api/produtos/:produtoId/avaliacoes/minha', require('./middlewares/autenticacaoMiddleware'), express.json({ limit: '8mb' }));
const imagensUpload = require('./routes/imagemRoutes');
app.use('/api', imagensUpload.router);
const opcoesMidia = { setHeaders: res => res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin') };
// "media" evita nomes frequentemente associados a publicidade por bloqueadores de conteúdo.
app.use('/api/media', express.static(imagensUpload.pasta, opcoesMidia));
// Mantém fotos já cadastradas acessíveis durante a transição.
app.use('/api/uploads', express.static(imagensUpload.pasta, opcoesMidia));
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
