const fs = require('fs');

// Monta a opção `ssl` do mysql2. Com DB_SSL=true, a cadeia e o nome do host
// são sempre verificados; DB_SSL_CA_PATH é opcional e, se vazio, valem as CAs do sistema.
function opcoesSslBanco(env = process.env) {
  if (env.DB_SSL !== 'true') return undefined;

  const opcoes = { rejectUnauthorized: true, verifyIdentity: true };
  const caminhoCa = (env.DB_SSL_CA_PATH || '').trim();
  if (caminhoCa) {
    try {
      opcoes.ca = fs.readFileSync(caminhoCa, 'utf8');
    } catch (erro) {
      throw new Error(`Não foi possível ler o certificado CA indicado em DB_SSL_CA_PATH (${caminhoCa}): ${erro.code || 'erro desconhecido'}`);
    }
  }
  return opcoes;
}

module.exports = { opcoesSslBanco };
