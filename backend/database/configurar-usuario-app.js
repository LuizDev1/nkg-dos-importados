const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

function identificador(valor, nome) {
  if (!/^[A-Za-z0-9_]{1,64}$/.test(valor || '')) throw new Error(`${nome} inválido`);
  return valor;
}

async function executar() {
  const database = identificador(process.env.DB_NAME, 'DB_NAME');
  const usuario = identificador(process.env.DB_USER, 'DB_USER');
  const hostUsuario = process.env.DB_USER_HOST || '%';
  const senha = process.env.DB_PASSWORD;
  if (!senha || senha.length < 16) throw new Error('DB_PASSWORD deve ter pelo menos 16 caracteres');
  if (!process.env.DB_ADMIN_USER || !process.env.DB_ADMIN_PASSWORD) {
    throw new Error('Configure DB_ADMIN_USER e DB_ADMIN_PASSWORD somente durante o provisionamento');
  }
  if (['root', 'admin'].includes(usuario.toLowerCase())) throw new Error('DB_USER deve ser uma conta exclusiva da aplicação');

  const conexao = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_ADMIN_USER,
    password: process.env.DB_ADMIN_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
  });
  try {
    const conta = `${conexao.escape(usuario)}@${conexao.escape(hostUsuario)}`;
    await conexao.query(`CREATE USER IF NOT EXISTS ${conta} IDENTIFIED BY ${conexao.escape(senha)}`);
    await conexao.query(`ALTER USER ${conta} IDENTIFIED BY ${conexao.escape(senha)}`);
    await conexao.query(`REVOKE ALL PRIVILEGES, GRANT OPTION FROM ${conta}`);
    await conexao.query(`GRANT SELECT, INSERT, UPDATE, DELETE ON ${conexao.escapeId(database)}.* TO ${conta}`);
    console.log(`Usuário ${usuario} configurado com privilégios mínimos em ${database}.`);
  } finally {
    await conexao.end();
  }
}

executar().catch((erro) => { console.error('Falha ao configurar usuário:', erro.message); process.exitCode = 1; });
