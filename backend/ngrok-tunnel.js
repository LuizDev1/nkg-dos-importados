const ngrok = require('@ngrok/ngrok');
require('dotenv').config();

async function iniciarTunel() {
  const forwarder = await ngrok.forward({
    addr: 'localhost:3000',
    authtoken_from_env: true,
  });

  console.log(`Túnel disponível em: ${forwarder.url()}`);
}

iniciarTunel();