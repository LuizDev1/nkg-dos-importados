const pool = require('../config/banco');
const Log = require('../models/Log');

async function buscar(req, res) {
  try {
    const [linhas] = await pool.execute(
      `SELECT id, whatsapp, email_suporte, aviso_ativo, aviso_texto,
        politica_devolucao, banner_url, banner_titulo, banner_link
       FROM configuracoes_loja WHERE id = 1`
    );

    res.json(linhas[0] || {});
  } catch (erro) {
    console.error('Erro ao buscar configurações:', erro);
    res.status(500).json({ mensagem: 'Erro ao buscar configurações' });
  }
}

async function atualizar(req, res) {
  const {
    whatsapp = '',
    email_suporte = '',
    aviso_ativo = false,
    aviso_texto = '',
    politica_devolucao = '',
    banner_url = '',
    banner_titulo = '',
    banner_link = '',
  } = req.body;

  try {
    await pool.execute(
      `UPDATE configuracoes_loja
       SET whatsapp = ?, email_suporte = ?, aviso_ativo = ?,
           aviso_texto = ?, politica_devolucao = ?,
           banner_url = ?, banner_titulo = ?, banner_link = ?
       WHERE id = 1`,
      [
        String(whatsapp).trim(),
        String(email_suporte).trim(),
        Boolean(aviso_ativo),
        String(aviso_texto).trim(),
        String(politica_devolucao).trim(),
        String(banner_url).trim(),
        String(banner_titulo).trim(),
        String(banner_link).trim(),
      ]
    );

    await Log.registrar({
      tipo: 'configuracao_loja',
      acao: 'atualizada',
      entidade_id: 1,
      usuario_id: req.usuario.id,
      detalhes: { campos: Object.keys(req.body).sort() },
    });

    res.json({ mensagem: 'Configurações atualizadas com sucesso' });
  } catch (erro) {
    console.error('Erro ao atualizar configurações:', erro);
    res.status(500).json({ mensagem: 'Erro ao atualizar configurações' });
  }
}

module.exports = { buscar, atualizar };
