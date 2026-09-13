const express = require('express');
require('dotenv').config();
const pool = require('./config/banco');

const app = express();
app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    const [resultado] = await pool.query('SELECT 1 + 1 AS soma');
    res.json({ status: 'ok', banco: 'conectado', teste: resultado[0].soma });
  } catch (erro) {
    res.status(500).json({ status: 'erro', mensagem: erro.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});