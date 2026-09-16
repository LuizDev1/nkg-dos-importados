import { useState } from 'react';
import { formatarCpf } from '../servicos/formatadores';

export default function FormularioConta({ conta, salvar, aoSalvar }) {
  const [dados, setDados] = useState({ nome: conta.nome, email: conta.email, cpf: formatarCpf(conta.cpf) });
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  async function enviar(evento) {
    evento.preventDefault();
    setCarregando(true);
    setErro('');
    setSucesso('');
    try {
      const atualizada = await salvar(dados);
      setDados({ nome: atualizada.nome, email: atualizada.email, cpf: formatarCpf(atualizada.cpf) });
      aoSalvar?.(atualizada);
      setSucesso('Informações atualizadas com sucesso.');
    } catch (erro) {
      setErro(erro.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="formulario-conta space-y-5">
      {erro && <p role="alert" className="rounded-lg bg-red-950/50 p-3 text-sm text-red-200">{erro}</p>}
      {sucesso && <p role="status" className="rounded-lg bg-emerald-950/50 p-3 text-sm text-emerald-200">{sucesso}</p>}
      {[
        ['nome', 'Nome completo', 'text', 150, 'name'],
        ['email', 'E-mail', 'email', 150, 'email'],
        ['cpf', 'CPF', 'text', 14, 'off'],
      ].map(([campo, titulo, tipo, limite, autocomplete]) => (
        <div key={campo}>
          <label htmlFor={`conta-${campo}`} className="mb-2 block text-sm text-[#aaa399]">{titulo}</label>
          <input id={`conta-${campo}`} type={tipo} maxLength={limite} required
            autoComplete={autocomplete} inputMode={campo === 'cpf' ? 'numeric' : undefined}
            disabled={carregando} value={dados[campo]}
            onChange={(e) => { setDados({ ...dados, [campo]: campo === 'cpf' ? formatarCpf(e.target.value) : e.target.value }); setSucesso(''); }}
            className="w-full rounded-md border border-[#3a3526] bg-[#151613] px-4 py-3 text-[#f4efe5] focus:outline-none disabled:opacity-60" />
        </div>
      ))}
      <p className="text-xs text-[#aaa399]">O CPF identifica o comprador no pagamento. A senha não é alterada aqui.</p>
      <button disabled={carregando} className="w-full rounded-md bg-[#d4af45] px-5 py-3 font-semibold text-[#090a09] hover:bg-[#e2c25d] disabled:opacity-50 sm:w-auto">
        {carregando ? 'Salvando...' : 'Salvar alterações'}
      </button>
    </form>
  );
}
