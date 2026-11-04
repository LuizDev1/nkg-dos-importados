const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function main() {
  console.log('Iniciando configuracao e migracao do banco MySQL...');

  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const adminUser = process.env.DB_ADMIN_USER || 'root';
  const adminPass = process.env.DB_ADMIN_PASSWORD || '';
  const database = process.env.DB_NAME || 'nkg_importados';
  const appUser = process.env.DB_USER || 'app_nkg';
  const appPass = process.env.DB_PASSWORD || 'senha_local_desenvolvimento';

  console.log(`Conectando como ${adminUser} em ${host}:${port}...`);

  let adminConn;
  try {
    adminConn = await mysql.createConnection({
      host,
      port,
      user: adminUser,
      password: adminPass,
      multipleStatements: true,
    });
    console.log('Conexao administrativa bem-sucedida!');
  } catch (err) {
    console.error('Erro ao conectar ao MySQL como administrador:', err.message);
    process.exit(1);
  }

  try {
    // 1. Criar o banco de dados se nao existir
    console.log(`Criando banco '${database}' se nao existir...`);
    await adminConn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);

    // 2. Executar schema.sql
    console.log('Aplicando schema.sql base...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await adminConn.query(schemaSql);
    console.log('Schema base aplicado com sucesso!');

    // 3. Configurar usuario da aplicacao se diferente de root
    if (appUser && appUser !== 'root') {
      console.log(`Configurando usuario da aplicacao '${appUser}'...`);
      try {
        await adminConn.query(`CREATE USER IF NOT EXISTS '${appUser}'@'%' IDENTIFIED BY '${appPass}';`);
        await adminConn.query(`ALTER USER '${appUser}'@'%' IDENTIFIED BY '${appPass}';`);
        await adminConn.query(`GRANT ALL PRIVILEGES ON \`${database}\`.* TO '${appUser}'@'%';`);
        await adminConn.query(`CREATE USER IF NOT EXISTS '${appUser}'@'localhost' IDENTIFIED BY '${appPass}';`);
        await adminConn.query(`ALTER USER '${appUser}'@'localhost' IDENTIFIED BY '${appPass}';`);
        await adminConn.query(`GRANT ALL PRIVILEGES ON \`${database}\`.* TO '${appUser}'@'localhost';`);
        await adminConn.query('FLUSH PRIVILEGES;');
        console.log(`Usuario '${appUser}' configurado com sucesso!`);
      } catch (userErr) {
        console.warn('Aviso ao configurar usuario app_nkg:', userErr.message);
        console.log('Continuando com o usuario admin...');
      }
    }
  } finally {
    await adminConn.end();
  }

  // 4. Executar migrations usando o pool no banco nkg_importados
  console.log('Executando migracoes adicionais...');
  const pool = mysql.createPool({
    host,
    port,
    user: adminUser,
    password: adminPass,
    database,
    waitForConnections: true,
    connectionLimit: 2,
    multipleStatements: true,
  });

  try {
    const pastaMigrations = path.join(__dirname, 'migrations');
    if (fs.existsSync(pastaMigrations)) {
      const arquivos = fs.readdirSync(pastaMigrations).filter((nome) => /\.(sql|js)$/.test(nome)).sort();
      for (const arquivo of arquivos) {
        if (arquivo.endsWith('.js')) {
          const modulo = require(path.join(pastaMigrations, arquivo));
          if (typeof modulo === 'function') {
            await modulo(pool);
            console.log(`Migracao executada: ${arquivo}`);
          }
          continue;
        }

        const conteudo = fs.readFileSync(path.join(pastaMigrations, arquivo), 'utf8');
        const comandos = conteudo
          .split(';')
          .map((c) => c.trim())
          .filter(Boolean);

        for (const comando of comandos) {
          try {
            await pool.query(comando);
          } catch (migErr) {
            // Ignorar erros esperados caso tabela ou coluna já existam
            if (!['ER_DUP_FIELDNAME', 'ER_TABLE_EXISTS_ERROR', 'ER_CANT_DROP_FIELD_OR_KEY', 'ER_DUP_KEYNAME'].includes(migErr.code)) {
              console.warn(`Aviso na migracao ${arquivo}: ${migErr.message}`);
            }
          }
        }
        console.log(`Migracao executada: ${arquivo}`);
      }
    }

    // 5. Listar tabelas criadas para validacao
    const [tabelas] = await pool.query('SHOW TABLES;');
    console.log('\nTabelas existentes no banco:');
    tabelas.forEach((row) => console.log(` - ${Object.values(row)[0]}`));
    console.log(`\nTotal de tabelas: ${tabelas.length}`);
    console.log('\nBanco de dados inicializado e configurado com sucesso!');
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error('\nFalha geral na inicializacao do banco:', err);
  process.exit(1);
});
