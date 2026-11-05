import { useLocation } from 'react-router-dom';
import { useAutenticacao } from '../../contextos/ContextoAutenticacao';
import Botao from '../../componentes/ui/Botao';

export default function NaoEncontrada() {
  const { pathname } = useLocation();
  const { usuario } = useAutenticacao();
  const admin = usuario?.perfil === 'admin';

  return (
    <section className="mx-auto max-w-xl px-4 py-16 text-center" aria-labelledby="titulo-nao-encontrada">
      <h1 id="titulo-nao-encontrada" className="text-3xl font-bold">Página não encontrada</h1>
      <p className="mt-3 text-texto-secundario">
        O endereço <span className="break-all font-mono text-sm text-texto">{pathname}</span> não existe ou foi removido.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Botao para={admin ? '/admin' : '/'} tamanho="lg">
          {admin ? 'Ir para o painel' : 'Ir para a loja'}
        </Botao>
        {!admin && (
          <Botao variante="secundario" tamanho="lg" para="/minha-conta/pedidos">
            Ver meus pedidos
          </Botao>
        )}
      </div>
    </section>
  );
}
