const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('../src/config/banco');
const { recriptografar, validarConfiguracao } = require('../src/utils/criptografia');

async function executar() {
  validarConfiguracao();
  if (!process.env.DATA_ENCRYPTION_PREVIOUS_KEYS) throw new Error('Informe a chave antiga em DATA_ENCRYPTION_PREVIOUS_KEYS');
  const conexao = await pool.getConnection();
  try {
    await conexao.beginTransaction();
    const [usuarios] = await conexao.query('SELECT id, cpf FROM usuarios WHERE cpf IS NOT NULL');
    for (const item of usuarios) await conexao.query('UPDATE usuarios SET cpf = ? WHERE id = ?', [recriptografar(item.cpf), item.id]);
    const [pedidos] = await conexao.query('SELECT id, endereco_entrega, telefone_contato, cep_entrega FROM pedidos');
    for (const item of pedidos) await conexao.query('UPDATE pedidos SET endereco_entrega = ?, telefone_contato = ?, cep_entrega = ? WHERE id = ?', [recriptografar(item.endereco_entrega), recriptografar(item.telefone_contato), recriptografar(item.cep_entrega), item.id]);
    const [enderecos] = await conexao.query('SELECT id, cep, rua, numero, complemento, bairro, cidade, telefone FROM enderecos_usuarios');
    for (const item of enderecos) {
      const valores = ['cep', 'rua', 'numero', 'complemento', 'bairro', 'cidade', 'telefone'].map((campo) => recriptografar(item[campo]));
      await conexao.query('UPDATE enderecos_usuarios SET cep = ?, rua = ?, numero = ?, complemento = ?, bairro = ?, cidade = ?, telefone = ? WHERE id = ?', [...valores, item.id]);
    }
    await conexao.commit();
    console.log('Rotação concluída. Valide os dados antes de remover a chave anterior.');
  } catch (erro) {
    await conexao.rollback();
    throw erro;
  } finally { conexao.release(); }
}

executar().catch((erro) => { console.error('Falha na rotação:', erro.message); process.exitCode = 1; }).finally(() => pool.end());
