const { criptografar, PREFIXO } = require('../../src/utils/criptografia');

module.exports = async function criptografarDadosSensiveis(pool) {
  const conexao = await pool.getConnection();
  try {
    await conexao.beginTransaction();
    await conexao.query('ALTER TABLE usuarios MODIFY cpf VARCHAR(255) NULL');
    await conexao.query('ALTER TABLE pedidos MODIFY telefone_contato VARCHAR(255) NOT NULL, MODIFY cep_entrega VARCHAR(255) NULL');
    await conexao.query(`ALTER TABLE enderecos_usuarios
      MODIFY cep TEXT NOT NULL,
      MODIFY rua TEXT NOT NULL,
      MODIFY numero TEXT NOT NULL,
      MODIFY complemento TEXT NOT NULL,
      MODIFY bairro TEXT NOT NULL,
      MODIFY cidade TEXT NOT NULL,
      MODIFY telefone TEXT NOT NULL`);

    if (!process.env.DATA_ENCRYPTION_KEY) {
      await conexao.commit();
      console.warn('Migração 014: colunas ampliadas, mas dados não foram criptografados porque DATA_ENCRYPTION_KEY não está definida.');
      return;
    }

    const [usuarios] = await conexao.query('SELECT id, cpf FROM usuarios WHERE cpf IS NOT NULL');
    for (const usuario of usuarios) {
      if (!String(usuario.cpf).startsWith(PREFIXO)) {
        await conexao.query('UPDATE usuarios SET cpf = ? WHERE id = ?', [criptografar(usuario.cpf), usuario.id]);
      }
    }

    const [pedidos] = await conexao.query('SELECT id, endereco_entrega, telefone_contato, cep_entrega FROM pedidos');
    for (const pedido of pedidos) {
      await conexao.query(
        'UPDATE pedidos SET endereco_entrega = ?, telefone_contato = ?, cep_entrega = ? WHERE id = ?',
        [criptografar(pedido.endereco_entrega), criptografar(pedido.telefone_contato), criptografar(pedido.cep_entrega), pedido.id]
      );
    }

    const [enderecos] = await conexao.query('SELECT * FROM enderecos_usuarios');
    for (const endereco of enderecos) {
      const valores = ['cep', 'rua', 'numero', 'complemento', 'bairro', 'cidade', 'telefone']
        .map((campo) => criptografar(endereco[campo]));
      await conexao.query(
        'UPDATE enderecos_usuarios SET cep = ?, rua = ?, numero = ?, complemento = ?, bairro = ?, cidade = ?, telefone = ? WHERE id = ?',
        [...valores, endereco.id]
      );
    }
    await conexao.commit();
  } catch (erro) {
    await conexao.rollback();
    throw erro;
  } finally {
    conexao.release();
  }
};
