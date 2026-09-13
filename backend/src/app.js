const express = require('express');
require('dotenv').config();
const pool = require('./config/banco');
const produtoRoutes = require('./routes/produtoRoutes');
const autenticacaoRoutes = require('./routes/autenticacaoRoutes');

const app = express();         
app.use(express.json());
app.use('/api', produtoRoutes);
app.use('/api', autenticacaoRoutes);

app.get('/health', async (req, res) => {
  // ...
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});