import { useState } from 'react';
import { formatarCpf } from '../servicos/formatadores.mjs';
import Botao from './ui/Botao';
import Campo from './ui/Campo';

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
      <div role="alert" className={erro ? 'rounded-cartao border border-erro-borda bg-erro-fundo p-3 text-sm text-erro-texto' : ''}>{erro}</div>
      <div role="status" className={sucesso ? 'rounded-cartao border border-sucesso-borda bg-sucesso-fundo p-3 text-sm text-sucesso-texto' : ''}>{sucesso}</div>
      {[
        ['nome', 'Nome completo', 'text', 150, 'name'],
        ['email', 'E-mail', 'email', 150, 'email'],
        ['cpf', 'CPF', 'text', 14, 'off'],
      ].map(([campo, titulo, tipo, limite, autocomplete]) => (
        <Campo
          key={campo}
          id={`conta-${campo}`}
          rotulo={titulo}
          name={campo}
          type={tipo}
          maxLength={limite}
          required
          autoComplete={autocomplete}
          inputMode={campo === 'cpf' ? 'numeric' : campo === 'email' ? 'email' : undefined}
          disabled={carregando}
          value={dados[campo]}
          onChange={(e) => { setDados({ ...dados, [campo]: campo === 'cpf' ? formatarCpf(e.target.value) : e.target.value }); setSucesso(''); }}
        />
      ))}
      <p className="text-xs text-texto-secundario">O CPF identifica o comprador no pagamento. A senha não é alterada aqui.</p>
      <Botao type="submit" carregando={carregando} className="w-full sm:w-auto">
        {carregando ? 'Salvando...' : 'Salvar alterações'}
      </Botao>
    </form>
  );
}
