const { Resend } = require('resend');
const pool = require('../config/banco');

const resend = new Resend(process.env.RESEND_API_KEY);

async function notificarStatusPedido(emailCliente, numeroPedido, status) {
  const conteudos = {
    'pago': {
      assunto: `Pagamento Aprovado! Pedido #${numeroPedido}`,
      html: `<h2>Oba! Seu pagamento foi aprovado.</h2>
             <p>Já estamos separando seus produtos. Em breve você receberá o código de rastreio.</p>`
    },
    'enviado': {
      assunto: `Seu pedido #${numeroPedido} está a caminho! 🚚`,
      html: `<h2>Boas notícias!</h2>
             <p>Seu pedido já foi despachado. Acesse sua conta na loja para acompanhar o rastreio.</p>`
    },
    'cancelado': {
      assunto: `Atualização sobre o pedido #${numeroPedido}`,
      html: `<p>Seu pedido foi cancelado. Se você não solicitou isso, entre em contato conosco.</p>`
    }
  };

  const conteudo = conteudos[status];
  if (!conteudo) return;

  try {
    const data = await resend.emails.send({
      from: 'NKG DOS IMPORTADOS <onboarding@resend.dev>', 
      to: emailCliente, 
      subject: conteudo.assunto,
      html: conteudo.html,
    });

    console.log(`E-mail enviado para o pedido ${numeroPedido}:`, data.id);
    return data;
  } catch (erro) {
    console.error('Erro ao enviar e-mail pelo Resend:', erro);
  }
}

async function notificarReposicao(produtoId, variacaoId = 0) {
  const [inscricoes] = await pool.query(
    `SELECT ae.usuario_id, u.email, p.nome AS produto_nome, pv.nome AS variacao_nome
     FROM avisos_estoque ae
     INNER JOIN usuarios u ON u.id = ae.usuario_id
     INNER JOIN produtos p ON p.id = ae.produto_id
     LEFT JOIN produto_variacoes pv ON pv.id = NULLIF(ae.variacao_id, 0)
     WHERE ae.produto_id = ? AND ae.variacao_id = ? AND u.status = 'ativo'`,
    [produtoId, variacaoId]
  );

  for (const inscricao of inscricoes) {
    const complemento = inscricao.variacao_nome ? ` - ${inscricao.variacao_nome}` : '';
    const resultado = await resend.emails.send({
      from: 'NKG DOS IMPORTADOS <onboarding@resend.dev>',
      to: inscricao.email,
      subject: `${inscricao.produto_nome}${complemento} voltou ao estoque`,
      html: `<h2>O produto que você queria voltou!</h2><p>${inscricao.produto_nome}${complemento} já está disponível na NKG dos Importados.</p>`,
    });
    if (!resultado.error) {
      await pool.query('DELETE FROM avisos_estoque WHERE usuario_id = ? AND produto_id = ? AND variacao_id = ?', [inscricao.usuario_id, produtoId, variacaoId]);
    }
  }
}

module.exports = { notificarStatusPedido, notificarReposicao };
