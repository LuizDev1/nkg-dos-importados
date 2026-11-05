import TabelaRolavel from '../../componentes/TabelaRolavel';
import Botao from '../../componentes/ui/Botao';
import Preco from '../../componentes/ui/Preco';
import SeloStatus from '../../componentes/ui/SeloStatus';
import CampoRotulado from '../../componentes/CampoRotulado';
import { useEffect, useState } from 'react';
import { avisarAdmin } from '../../utilitarios/avisoAdmin';
import { Link } from 'react-router-dom';
import {
  listarPromocoes,
  criarPromocao,
  atualizarPromocao,
  desativarPromocao,
  reativarPromocao,
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

function separarDataHora(valor) {
  if (!valor) return { data: '', hora: '' };
  const data = new Date(valor);
  const local = new Date(data.getTime() - data.getTimezoneOffset() * 60000).toISOString();
  return { data: local.slice(0, 10), hora: local.slice(11, 16) };
}

export default function Promocoes() {
  const [promocoes, setPromocoes] = useState([]);
  const [form, setForm] = useState(FORM_VAZIO);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [editandoId, setEditandoId] = useState(null);

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
      const dados = {
        codigo: form.codigo,
        tipo: form.tipo,
        valor: Number(form.valor),
        ...(inicio ? { inicio_em: inicio } : {}),
        ...(fim ? { fim_em: fim } : {}),
        ...(form.uso_maximo ? { uso_maximo: Number(form.uso_maximo) } : {}),
      };
      if (editandoId) await atualizarPromocao(editandoId, dados);
      else await criarPromocao(dados);
      setForm(FORM_VAZIO);
      setEditandoId(null);
      await carregar();
      avisarAdmin(editandoId ? 'Promoção atualizada com sucesso.' : 'Promoção criada com sucesso.');
    } catch (erroSalvamento) {
      setErro(erroSalvamento.message);
    } finally {
      setSalvando(false);
    }
  }

  async function aoReativar(id) {
    try {
      await reativarPromocao(id);
      await carregar();
      avisarAdmin('Promoção reativada com sucesso.');
    } catch (erroReativacao) {
      setErro(erroReativacao.message);
    }
  }

  function aoEditar(promocao) {
    const inicio = separarDataHora(promocao.inicio_em);
    const fim = separarDataHora(promocao.fim_em);
    setEditandoId(promocao.id);
    setForm({
      codigo: promocao.codigo,
      tipo: promocao.tipo,
      valor: promocao.valor,
      inicio_data: inicio.data,
      inicio_hora: inicio.hora,
      fim_data: fim.data,
      fim_hora: fim.hora,
      uso_maximo: promocao.uso_maximo || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function aoDesativar(id) {
    try {
      await desativarPromocao(id);
      await carregar();
      avisarAdmin('Promoção desativada com sucesso.');
    } catch (erroDesativacao) {
      setErro(erroDesativacao.message);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to="/admin" className="botao-voltar">
        &larr; Voltar ao painel
      </Link>

      <h1 className="text-2xl font-bold mt-2 mb-6">Promoções</h1>
      <div role="alert" className={erro ? "text-erro mb-4" : ""}>{erro}</div>

      <form onSubmit={aoSalvar} className="bg-white rounded-lg shadow p-4 mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <CampoRotulado rotulo="Código" name="codigo" value={form.codigo} onChange={aoMudarCampo} placeholder="Código" required maxLength="50" className="border rounded px-2 py-1" />
        <CampoRotulado rotulo="Tipo de desconto" as="select" name="tipo" value={form.tipo} onChange={aoMudarCampo} className="border rounded px-2 py-1">
          <option value="percentual">Percentual</option>
          <option value="fixo">Valor fixo</option>
        </CampoRotulado>
        <CampoRotulado rotulo={form.tipo === 'percentual' ? 'Percentual' : 'Valor'} name="valor" value={form.valor} onChange={aoMudarCampo} placeholder={form.tipo === 'percentual' ? 'Percentual' : 'Valor'} type="number" min="0.01" step="0.01" required className="border rounded px-2 py-1" />
        <fieldset className="min-w-0 text-sm text-gray-600">
          <legend>Início</legend>
          <div className="flex flex-wrap gap-2">
            <input name="inicio_data" value={form.inicio_data} onChange={aoMudarCampo} type="date" aria-label="Data de início" className="min-w-0 flex-1 basis-32 border rounded px-2 py-1 text-gray-900" />
            <input name="inicio_hora" value={form.inicio_hora} onChange={aoMudarCampo} type="time" aria-label="Hora de início" className="min-w-0 flex-1 basis-32 border rounded px-2 py-1 text-gray-900" />
          </div>
        </fieldset>
        <fieldset className="min-w-0 text-sm text-gray-600">
          <legend>Fim</legend>
          <div className="flex flex-wrap gap-2">
            <input name="fim_data" value={form.fim_data} onChange={aoMudarCampo} type="date" aria-label="Data de fim" className="min-w-0 flex-1 basis-32 border rounded px-2 py-1 text-gray-900" />
            <input name="fim_hora" value={form.fim_hora} onChange={aoMudarCampo} type="time" aria-label="Hora de fim" className="min-w-0 flex-1 basis-32 border rounded px-2 py-1 text-gray-900" />
          </div>
        </fieldset>
        <CampoRotulado rotulo="Limite de usos" name="uso_maximo" value={form.uso_maximo} onChange={aoMudarCampo} placeholder="Limite de usos" type="number" min="1" step="1" className="border rounded px-2 py-1" />
        <div className="flex justify-end gap-2 sm:col-span-2 lg:col-span-3">
          {Boolean(editandoId) && (
            <Botao variante="discreto" onClick={() => { setEditandoId(null); setForm(FORM_VAZIO); }}>
              Cancelar
            </Botao>
          )}
          <Botao type="submit" carregando={salvando}>
            {salvando ? 'Salvando...' : editandoId ? 'Salvar alterações' : 'Criar promoção'}
          </Botao>
        </div>
      </form>

      {carregando ? <p>Carregando promoções...</p> : (
        <TabelaRolavel rotulo="Promoções cadastradas">
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
                  <td className="p-3 tabular-nums">{promocao.tipo === 'percentual' ? `${promocao.valor}%` : <Preco valor={promocao.valor} />}</td>
                  <td className="p-3">{promocao.usos}{promocao.uso_maximo ? ` / ${promocao.uso_maximo}` : ''}</td>
                  <td className="p-3"><SeloStatus status={promocao.ativo ? 'ativa' : 'inativa'}>{promocao.ativo ? 'Ativa' : 'Inativa'}</SeloStatus></td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Botao variante="discreto" tamanho="sm" onClick={() => aoEditar(promocao)} aria-label={`Editar ${promocao.codigo}`}>Editar</Botao>
                      {promocao.ativo ? (
                        <Botao variante="destrutivo" tamanho="sm" onClick={() => aoDesativar(promocao.id)} aria-label={`Desativar ${promocao.codigo}`}>Desativar</Botao>
                      ) : (
                        <Botao variante="secundario" tamanho="sm" onClick={() => aoReativar(promocao.id)} aria-label={`Reativar ${promocao.codigo}`}>Reativar</Botao>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TabelaRolavel>
      )}
    </div>
  );
}
