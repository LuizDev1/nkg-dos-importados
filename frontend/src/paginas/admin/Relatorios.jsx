import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { buscarRelatorioMensal } from '../../servicos/relatorioService';

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

  function formatarMoeda(valor) {
    return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/admin" className="text-blue-600 hover:underline text-sm">
        &larr; Voltar ao painel
      </Link>

      <h1 className="text-2xl font-bold mt-2 mb-6">Relatório do mês</h1>

      {carregando && <p>Carregando relatório...</p>}
      {erro && <p className="text-red-600">{erro}</p>}

      {dados && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-sm text-gray-500 mb-1">Total vendido</p>
            <p className="text-2xl font-bold">{formatarMoeda(dados.total_vendido)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-sm text-gray-500 mb-1">Pedidos pagos</p>
            <p className="text-2xl font-bold">{dados.quantidade_pedidos}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-sm text-gray-500 mb-1">Ticket médio</p>
            <p className="text-2xl font-bold">{formatarMoeda(dados.ticket_medio)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
