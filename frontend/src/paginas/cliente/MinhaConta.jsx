import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import FormularioConta from '../../componentes/FormularioConta';
import { buscarMinhaConta, salvarMinhaConta } from '../../servicos/contaService';
import { useAutenticacao } from '../../contextos/ContextoAutenticacao';
import EnderecosConta from '../../componentes/EnderecosConta';
import SeloStatus from '../../componentes/ui/SeloStatus';
import Superficie from '../../componentes/ui/Superficie';

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
    <div className="mx-auto max-w-3xl px-4 py-10 text-texto">
      <Link to="/" className="botao-voltar">← Voltar para a loja</Link>
      <p className="mt-8 text-xs uppercase tracking-[0.25em] text-marca-texto">Seu espaço</p>
      <h1 className="mt-2 text-3xl font-bold">Minha conta</h1>
      <p className="mt-2 mb-8 text-texto-secundario">Confira e mantenha suas informações atualizadas.</p>
      {erro ? <p role="alert" className="text-erro">{erro}</p> : !conta ? <p role="status">Carregando conta...</p> : (
        <Superficie as="section" sombra espacamento="amplo">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-borda pb-5">
            <h2 className="text-lg font-semibold">Informações pessoais</h2>
            <SeloStatus tom={conta.status === 'bloqueado' ? 'erro' : 'sucesso'}>
              {conta.status === 'bloqueado' ? 'Conta bloqueada' : 'Conta ativa'}
            </SeloStatus>
          </div>
          <FormularioConta conta={conta} salvar={salvarMinhaConta} aoSalvar={(dados) => {
            setConta(dados); atualizarUsuario(dados);
          }} />
          <EnderecosConta />
          <div className="mt-7 flex flex-wrap gap-5 border-t border-borda pt-5 text-sm text-marca-texto">
            <Link to="/minha-conta/pedidos" className="hover:underline">Meus pedidos</Link>
            <Link to="/privacidade" className="hover:underline">Privacidade e dados</Link>
          </div>
        </Superficie>
      )}
    </div>
  );
}
