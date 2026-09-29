const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_ADMIN_USER || process.env.DB_USER,
  password: process.env.DB_ADMIN_PASSWORD || process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 2,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
});

async function executar() {
  const pasta = path.join(__dirname, 'migrations');
  const arquivos = fs.readdirSync(pasta).filter((nome) => /\.(sql|js)$/.test(nome)).sort();

  for (const arquivo of arquivos) {
    if (arquivo.endsWith('.js')) {
      await require(path.join(pasta, arquivo))(pool);
      console.log(`Migração aplicada: ${arquivo}`);
      continue;
    }
    const comandos = fs.readFileSync(path.join(pasta, arquivo), 'utf8')
      .split(';')
      .map((comando) => comando.trim())
      .filter(Boolean);

    for (const comando of comandos) {
      try {
        await pool.query(comando);
      } catch (erro) {
        if (!['ER_DUP_FIELDNAME', 'ER_TABLE_EXISTS_ERROR'].includes(erro.code)) throw erro;
      }
    }
    console.log(`Migração aplicada: ${arquivo}`);
  }
}

executar()
  .then(() => pool.end())
  .catch(async (erro) => {
    console.error('Erro ao executar migrações:', erro.message);
    await pool.end();
    process.exitCode = 1;
  });
