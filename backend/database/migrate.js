const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('../src/config/banco');

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

    for (const comando of comandos) await pool.query(comando);
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
