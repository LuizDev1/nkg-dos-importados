const express = require('express');
require('dotenv').config();
const pool = require('./config/banco');
const produtoRoutes = require('./routes/produtoRoutes');
const autenticacaoRoutes = require('./routes/autenticacaoRoutes');
const pedidoRoutes = require('./routes/pedidoRoutes');
const pagamentoRoutes = require('./routes/pagamentoRoutes');
const relatorioRoutes = require('./routes/relatorioRoutes');
const cors = require('cors');


const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', produtoRoutes);
app.use('/api', autenticacaoRoutes);
app.use('/api', pedidoRoutes);
app.use('/api', pagamentoRoutes);
app.use('/api', relatorioRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});