import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  listarPromocoes,
  criarPromocao,
  desativarPromocao,
} from '../../servicos/promocaoService';

const FORM_VAZIO = {
  codigo: '',
  tipo: 'percentual',
  valor: '',
  inicio_data: '',
  inicio_hora: '',
  fim_data: '',
  fim_hora: '',
  uso_maximo: '',
};

function montarDataHora(data, hora) {
  return data && hora ? `${data}T${hora}` : '';
}

export default function Promocoes() {
  const [promocoes, setPromocoes] = useState([]);
  const [form, setForm] = useState(FORM_VAZIO);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  async function carregar() {
    try {
      setCarregando(true);
      setPromocoes(await listarPromocoes());
    } catch (erroCarregamento) {
      setErro(erroCarregamento.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function aoMudarCampo(evento) {
    const { name, value } = evento.target;
    setForm((atual) => ({
      ...atual,
      [name]: name === 'codigo' ? value.toUpperCase() : value,
    }));
  }

  async function aoSalvar(evento) {
    evento.preventDefault();
    setErro('');

    const inicio = montarDataHora(form.inicio_data, form.inicio_hora);
    const fim = montarDataHora(form.fim_data, form.fim_hora);

    if ((form.inicio_data && !form.inicio_hora) || (form.inicio_hora && !form.inicio_data)) {
      setErro('Preencha a data e a hora de início.');
      return;
    }

    if ((form.fim_data && !form.fim_hora) || (form.fim_hora && !form.fim_data)) {
      setErro('Preencha a data e a hora de fim.');
      return;
    }

    if (inicio && fim && new Date(fim) <= new Date(inicio)) {
      setErro('O fim deve ser posterior ao início.');
      return;
    }

    if (form.tipo === 'percentual' && Number(form.valor) > 100) {
      setErro('O percentual não pode ser maior que 100.');
      return;
    }

    setSalvando(true);

    try {
      await criarPromocao({
        codigo: form.codigo,
        tipo: form.tipo,
        valor: Number(form.valor),
        ...(inicio ? { inicio_em: inicio } : {}),
        ...(fim ? { fim_em: fim } : {}),
        ...(form.uso_maximo ? { uso_maximo: Number(form.uso_maximo) } : {}),
      });
      setForm(FORM_VAZIO);
      await carregar();
    } catch (erroSalvamento) {
      setErro(erroSalvamento.message);
    } finally {
      setSalvando(false);
    }
  }

  async function aoDesativar(id) {
    try {
      await desativarPromocao(id);
      await carregar();
    } catch (erroDesativacao) {
      setErro(erroDesativacao.message);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to="/admin" className="text-blue-600 hover:underline text-sm">
        &larr; Voltar ao painel
      </Link>

      <h1 className="text-2xl font-bold mt-2 mb-6">Promoções</h1>
      {erro && <p className="text-red-600 mb-4">{erro}</p>}

      <form onSubmit={aoSalvar} className="bg-white rounded-lg shadow p-4 mb-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
        <input name="codigo" value={form.codigo} onChange={aoMudarCampo} placeholder="Código" required maxLength="50" className="border rounded px-2 py-1" />
        <select name="tipo" value={form.tipo} onChange={aoMudarCampo} className="border rounded px-2 py-1">
          <option value="percentual">Percentual</option>
          <option value="fixo">Valor fixo</option>
        </select>
        <input name="valor" value={form.valor} onChange={aoMudarCampo} placeholder={form.tipo === 'percentual' ? 'Percentual' : 'Valor'} type="number" min="0.01" step="0.01" required className="border rounded px-2 py-1" />
        <fieldset className="text-sm text-gray-600">
          <legend>Início</legend>
          <div className="flex gap-2">
            <input name="inicio_data" value={form.inicio_data} onChange={aoMudarCampo} type="date" aria-label="Data de início" className="w-full border rounded px-2 py-1 text-gray-900" />
            <input name="inicio_hora" value={form.inicio_hora} onChange={aoMudarCampo} type="time" aria-label="Hora de início" className="w-full border rounded px-2 py-1 text-gray-900" />
          </div>
        </fieldset>
        <fieldset className="text-sm text-gray-600">
          <legend>Fim</legend>
          <div className="flex gap-2">
            <input name="fim_data" value={form.fim_data} onChange={aoMudarCampo} type="date" aria-label="Data de fim" className="w-full border rounded px-2 py-1 text-gray-900" />
            <input name="fim_hora" value={form.fim_hora} onChange={aoMudarCampo} type="time" aria-label="Hora de fim" className="w-full border rounded px-2 py-1 text-gray-900" />
          </div>
        </fieldset>
        <input name="uso_maximo" value={form.uso_maximo} onChange={aoMudarCampo} placeholder="Limite de usos" type="number" min="1" step="1" className="border rounded px-2 py-1" />
        <button type="submit" disabled={salvando} className="col-span-2 sm:col-span-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400">
          {salvando ? 'Salvando...' : 'Criar promoção'}
        </button>
      </form>

      {carregando ? <p>Carregando promoções...</p> : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-lg shadow overflow-hidden text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Código</th>
                <th className="p-3">Desconto</th>
                <th className="p-3">Usos</th>
                <th className="p-3">Status</th>
                <th className="p-3">Ação</th>
              </tr>
            </thead>
            <tbody>
              {promocoes.map((promocao) => (
                <tr key={promocao.id} className="border-t">
                  <td className="p-3 font-semibold">{promocao.codigo}</td>
                  <td className="p-3">{promocao.tipo === 'percentual' ? `${promocao.valor}%` : `R$ ${Number(promocao.valor).toFixed(2).replace('.', ',')}`}</td>
                  <td className="p-3">{promocao.usos}{promocao.uso_maximo ? ` / ${promocao.uso_maximo}` : ''}</td>
                  <td className="p-3">{promocao.ativo ? 'Ativa' : 'Inativa'}</td>
                  <td className="p-3">
                    {promocao.ativo && <button onClick={() => aoDesativar(promocao.id)} className="text-red-600 hover:underline">Desativar</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
