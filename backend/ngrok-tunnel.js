const ngrok = require('@ngrok/ngrok');
require('dotenv').config();

async function iniciarTunel() {
  try {
    const forwarder = await ngrok.forward({
      addr: process.env.NGROK_ADDR || `localhost:${process.env.PORT || 3000}`,
      authtoken_from_env: true,
    });

    const url = forwarder.url();
    console.log(`Túnel disponível em: ${url}`);
    console.log(`Webhook Mercado Pago: ${url}/api/pagamentos/webhook`);
  } catch (erro) {
    if (erro.code === 'ERR_NGROK_4018' || erro.errorCode === 'ERR_NGROK_4018') {
      console.error(
        'Configure NGROK_AUTHTOKEN no backend/.env antes de iniciar o túnel.'
      );
      console.error(
        'Obtenha o token em https://dashboard.ngrok.com/get-started/your-authtoken'
      );
      return;
    }

    console.error('Não foi possível iniciar o túnel ngrok:', erro.message);
  }
}

iniciarTunel();