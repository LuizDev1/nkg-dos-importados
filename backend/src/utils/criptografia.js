const crypto = require('crypto');

const PREFIXO_V1 = 'enc:v1:';
const PREFIXO_V2 = 'enc:v2:';

function decodificarChave(valor, nome) {
  const chave = /^[a-f0-9]{64}$/i.test(valor || '') ? Buffer.from(valor, 'hex') : Buffer.from(valor || '', 'base64');
  if (chave.length !== 32) throw new Error(`${nome} deve representar exatamente 32 bytes`);
  return chave;
}

function obterChaveAtual() {
  const valor = process.env.DATA_ENCRYPTION_KEY;
  if (!valor) return null;
  const id = process.env.DATA_ENCRYPTION_KEY_ID || 'principal';
  if (!/^[A-Za-z0-9_-]{1,40}$/.test(id)) throw new Error('DATA_ENCRYPTION_KEY_ID inválido');
  return { id, chave: decodificarChave(valor, 'DATA_ENCRYPTION_KEY') };
}

function obterChavesAnteriores() {
  const chaves = new Map();
  const valor = String(process.env.DATA_ENCRYPTION_PREVIOUS_KEYS || '').trim();
  if (!valor) return chaves;
  for (const item of valor.split(',')) {
    const separador = item.indexOf(':');
    if (separador <= 0) throw new Error('DATA_ENCRYPTION_PREVIOUS_KEYS inválida');
    const id = item.slice(0, separador).trim();
    const segredo = item.slice(separador + 1).trim();
    if (!/^[A-Za-z0-9_-]{1,40}$/.test(id)) throw new Error('Identificador de chave anterior inválido');
    chaves.set(id, decodificarChave(segredo, `Chave anterior ${id}`));
  }
  return chaves;
}

function todasAsChaves() {
  const atual = obterChaveAtual();
  const chaves = obterChavesAnteriores();
  if (atual) chaves.set(atual.id, atual.chave);
  return { atual, chaves };
}

function validarConfiguracao() {
  if (!obterChaveAtual()) throw new Error('DATA_ENCRYPTION_KEY não configurada');
  obterChavesAnteriores();
}

function cifrar(texto, chave, prefixo) {
  const iv = crypto.randomBytes(12);
  const cifra = crypto.createCipheriv('aes-256-gcm', chave, iv);
  const cifrado = Buffer.concat([cifra.update(texto, 'utf8'), cifra.final()]);
  const tag = cifra.getAuthTag();
  return `${prefixo}${iv.toString('base64')}:${tag.toString('base64')}:${cifrado.toString('base64')}`;
}

function criptografar(valor) {
  if (valor === null || valor === undefined || valor === '') return valor;
  const texto = String(valor);
  if (texto.startsWith(PREFIXO_V1) || texto.startsWith(PREFIXO_V2)) return texto;
  const atual = obterChaveAtual();
  if (!atual) {
    if (process.env.NODE_ENV === 'production') throw new Error('DATA_ENCRYPTION_KEY não configurada');
    return texto;
  }
  return cifrar(texto, atual.chave, `${PREFIXO_V2}${atual.id}:`);
}

function decifrarComChave(partes, chave) {
  if (partes.length !== 3) throw new Error('Dado criptografado inválido');
  const [iv, tag, conteudo] = partes.map((parte) => Buffer.from(parte, 'base64'));
  const decifra = crypto.createDecipheriv('aes-256-gcm', chave, iv);
  decifra.setAuthTag(tag);
  return Buffer.concat([decifra.update(conteudo), decifra.final()]).toString('utf8');
}

function descriptografar(valor) {
  if (valor === null || valor === undefined || valor === '') return valor;
  const texto = String(valor);
  if (!texto.startsWith(PREFIXO_V1) && !texto.startsWith(PREFIXO_V2)) return texto;
  const { atual, chaves } = todasAsChaves();
  if (!atual) throw new Error('DATA_ENCRYPTION_KEY necessária para ler dados criptografados');
  if (texto.startsWith(PREFIXO_V2)) {
    const partes = texto.slice(PREFIXO_V2.length).split(':');
    const id = partes.shift();
    const chave = chaves.get(id);
    if (!chave) throw new Error(`Chave de criptografia ${id} não disponível`);
    return decifrarComChave(partes, chave);
  }
  const partes = texto.slice(PREFIXO_V1.length).split(':');
  let ultimoErro;
  for (const chave of chaves.values()) {
    try { return decifrarComChave(partes, chave); } catch (erro) { ultimoErro = erro; }
  }
  throw ultimoErro || new Error('Nenhuma chave disponível para dado v1');
}

function recriptografar(valor) {
  if (valor === null || valor === undefined || valor === '') return valor;
  const aberto = descriptografar(valor);
  const atual = obterChaveAtual();
  if (!atual) throw new Error('DATA_ENCRYPTION_KEY não configurada');
  return cifrar(String(aberto), atual.chave, `${PREFIXO_V2}${atual.id}:`);
}

function descriptografarCampos(registro, campos) {
  if (!registro) return registro;
  const copia = { ...registro };
  for (const campo of campos) copia[campo] = descriptografar(copia[campo]);
  return copia;
}

module.exports = { criptografar, descriptografar, recriptografar, descriptografarCampos, validarConfiguracao, PREFIXO: PREFIXO_V2 };
