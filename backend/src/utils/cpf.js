function normalizarCpf(valor) {
  return String(valor || '').replace(/[.\-\s]/g, '');
}

function validarCpf(valor) {
  const cpf = normalizarCpf(valor);
  if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false;
  for (let tamanho = 9; tamanho <= 10; tamanho += 1) {
    let soma = 0;
    for (let i = 0; i < tamanho; i += 1) soma += Number(cpf[i]) * (tamanho + 1 - i);
    const digito = (soma * 10) % 11;
    if (Number(cpf[tamanho]) !== (digito === 10 ? 0 : digito)) return false;
  }
  return true;
}

module.exports = { normalizarCpf, validarCpf };
