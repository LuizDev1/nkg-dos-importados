import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import FormularioConta from '../../componentes/FormularioConta';
import { buscarMinhaConta, salvarMinhaConta } from '../../servicos/contaService';
import { useAutenticacao } from '../../contextos/ContextoAutenticacao';
import EnderecosConta from '../../componentes/EnderecosConta';

export default function MinhaConta() {
  const [conta, setConta] = useState(null);
  const [erro, setErro] = useState('');
  const { atualizarUsuario } = useAutenticacao();
  useEffect(() => {
    let ativa = true;
    buscarMinhaConta().then((dados) => { if (ativa) setConta(dados); })
      .catch((erro) => { if (ativa) setErro(erro.message); });
    return () => { ativa = false; };
  }, []);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-[#f4efe5]">
      <Link to="/" className="botao-voltar">← Voltar para a loja</Link>
      <p className="mt-8 text-xs uppercase tracking-[0.25em] text-[#d4af45]">Seu espaço</p>
      <h1 className="mt-2 text-3xl font-bold">Minha conta</h1>
      <p className="mt-2 mb-8 text-[#aaa399]">Confira e mantenha suas informações atualizadas.</p>
      {erro ? <p role="alert" className="text-red-400">{erro}</p> : !conta ? <p>Carregando conta...</p> : (
        <section className="rounded-md border border-[#343024] bg-[#111210] p-6 shadow-lg sm:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#343024] pb-5">
            <h2 className="text-lg font-semibold">Informações pessoais</h2>
            <span className={`rounded-full border px-3 py-1 text-xs ${
              conta.status === 'bloqueado'
                ? 'border-red-900 bg-red-950/40 text-red-400'
                : 'border-green-900 bg-green-950/40 text-green-400'
            }`}>
              {conta.status === 'bloqueado' ? 'Conta bloqueada' : 'Conta ativa'}
            </span>
          </div>
          <FormularioConta conta={conta} salvar={salvarMinhaConta} aoSalvar={(dados) => {
            setConta(dados); atualizarUsuario(dados);
          }} />
          <EnderecosConta />
          <div className="mt-7 flex flex-wrap gap-5 border-t border-[#343024] pt-5 text-sm text-[#d4af45]">
            <Link to="/minha-conta/pedidos" className="hover:underline">Meus pedidos</Link>
            <Link to="/privacidade" className="hover:underline">Privacidade e dados</Link>
          </div>
        </section>
      )}
    </main>
  );
}
