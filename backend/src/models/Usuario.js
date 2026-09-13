const pool = require('../config/banco');
const bcrypt = require('bcrypt');

async function criar(dadosUsuarios){
    const { nome, email, senha, perfil, cpf } = dadosUsuarios;
    const senhaHash = await bcrypt.hash(senha, 10);

    const [resultado] = await pool.query(
        'INSERT INTO usuarios (nome, email, senha_hash, perfil, cpf) VALUES (?, ?, ?, ?, ?)',
        [nome, email, senhaHash, perfil, cpf]
    );
    return resultado.insertId;
};

async function buscarPorEmail(email){
    const [usuarios] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    return usuarios[0];  
};

async function buscarPorId(id){
    const usuarios = await pool.query('SELECT * FROM usuarios WHERE id = ?', [id]);

    return usuarios[0];
    
};
async function atualizarCpf(id, cpf) {
  await pool.query('UPDATE usuarios SET cpf = ? WHERE id = ?', [cpf, id]);
}

module.exports = {
  buscarPorEmail,
  buscarPorId,
  criar,
  atualizarCpf
};

