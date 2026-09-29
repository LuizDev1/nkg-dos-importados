const ENDPOINT = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

async function validarToken(token, ip, acaoEsperada) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return process.env.NODE_ENV !== 'production';
  if (typeof token !== 'string' || !token || token.length > 2048) return false;

  const resposta = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret, response: token, remoteip: ip }),
    signal: AbortSignal.timeout(5000),
  });
  if (!resposta.ok) throw new Error(`Turnstile respondeu com status ${resposta.status}`);
  const resultado = await resposta.json();
  if (!resultado.success) return false;
  if (acaoEsperada && resultado.action !== acaoEsperada) return false;
  const hostname = process.env.TURNSTILE_EXPECTED_HOSTNAME;
  if (hostname && resultado.hostname !== hostname) return false;
  return true;
}

function protegerFormulario(acao) {
  return async (req, res, next) => {
    const token = req.body?.turnstile_token;
    if (req.body && Object.hasOwn(req.body, 'turnstile_token')) delete req.body.turnstile_token;
    try {
      if (!await validarToken(token, req.ip, acao)) {
        return res.status(403).json({ mensagem: 'Não foi possível confirmar que você é uma pessoa' });
      }
      return next();
    } catch (erro) {
      console.error('Falha ao validar Turnstile:', erro.message);
      return res.status(503).json({ mensagem: 'Validação anti-bot temporariamente indisponível' });
    }
  };
}

module.exports = { protegerFormulario, validarToken };
