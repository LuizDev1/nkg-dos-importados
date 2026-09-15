const { Resend } = require('resend');

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

module.exports = { notificarStatusPedido };