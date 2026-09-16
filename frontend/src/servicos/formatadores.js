const numeros = (valor = '') => String(valor).replace(/\D/g, '');
export function formatarCpf(valor) { const v = numeros(valor).slice(0, 11); return v.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2'); }
export function formatarCep(valor) { const v = numeros(valor).slice(0, 8); return v.replace(/(\d{5})(\d)/, '$1-$2'); }
export function formatarTelefone(valor) { const v = numeros(valor).slice(0, 11); return v.length <= 10 ? v.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2') : v.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2'); }
