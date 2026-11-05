import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { buscarRelatorioMensal } from '../../servicos/relatorioService';
import Preco from '../../componentes/ui/Preco';
import Superficie from '../../componentes/ui/Superficie';

export default function Relatorios() {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    async function carregar() {
      try {
        const resultado = await buscarRelatorioMensal();
        setDados(resultado);
      } catch (erro) {
        setErro(erro.message);
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/admin" className="botao-voltar">
        &larr; Voltar ao painel
      </Link>

      <h1 className="text-2xl font-bold mt-2 mb-6">Relatório do mês</h1>

      {carregando && <p role="status">Carregando relatório...</p>}
      <p role="alert" className={erro ? 'text-erro' : ''}>{erro}</p>

      {dados && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Superficie sombra className="text-center">
            <p className="text-sm text-texto-secundario mb-1">Total vendido</p>
            <Preco valor={dados.total_vendido} as="p" className="text-2xl font-bold" />
          </Superficie>
          <Superficie sombra className="text-center">
            <p className="text-sm text-texto-secundario mb-1">Pedidos pagos</p>
            <p className="text-2xl font-bold tabular-nums">{dados.quantidade_pedidos}</p>
          </Superficie>
          <Superficie sombra className="text-center">
            <p className="text-sm text-texto-secundario mb-1">Ticket médio</p>
            <Preco valor={dados.ticket_medio} as="p" className="text-2xl font-bold" />
          </Superficie>
        </div>
      )}
    </div>
  );
}
