import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import FormularioConta from '../../componentes/FormularioConta';
import { buscarMinhaConta, salvarMinhaConta } from '../../servicos/contaService';
import { useAutenticacao } from '../../contextos/ContextoAutenticacao';

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
    <main className="mx-auto max-w-3xl px-4 py-10 text-zinc-100">
      <Link to="/" className="text-sm text-amber-400 hover:underline">← Voltar para a loja</Link>
      <p className="mt-8 text-xs uppercase tracking-[0.25em] text-amber-500">Seu espaço</p>
      <h1 className="mt-2 text-3xl font-bold">Minha conta</h1>
      <p className="mt-2 mb-8 text-zinc-400">Confira e mantenha suas informações atualizadas.</p>
      {erro ? <p role="alert" className="text-red-400">{erro}</p> : !conta ? <p>Carregando conta...</p> : (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-xl sm:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-5">
            <h2 className="text-lg font-semibold">Informações pessoais</h2>
            <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300">
              {conta.status === 'bloqueado' ? 'Conta bloqueada' : 'Conta ativa'}
            </span>
          </div>
          <FormularioConta conta={conta} salvar={salvarMinhaConta} aoSalvar={(dados) => {
            setConta(dados); atualizarUsuario(dados);
          }} />
          <div className="mt-7 flex flex-wrap gap-5 border-t border-zinc-800 pt-5 text-sm text-amber-400">
            <Link to="/minha-conta/pedidos" className="hover:underline">Meus pedidos</Link>
            <Link to="/privacidade" className="hover:underline">Privacidade e dados</Link>
          </div>
        </section>
      )}
    </main>
  );
}
