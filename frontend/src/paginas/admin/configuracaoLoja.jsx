import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  buscarConfiguracoes,
  atualizarConfiguracoes,
} from '../../servicos/configuracaoService';

const inicial = {
  whatsapp: '',
  email_suporte: '',
  aviso_ativo: false,
  aviso_texto: '',
  politica_devolucao: '',
  frete_fixo: 0,
  banner_url: '',
  banner_titulo: '',
  banner_link: '',
};

export default function ConfiguracaoLoja() {
  const [formulario, setFormulario] = useState(inicial);
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    async function carregar() {
      try {
        const dados = await buscarConfiguracoes();

        setFormulario({
          ...inicial,
          ...dados,
          aviso_ativo: Boolean(dados.aviso_ativo),
        });
      } catch (erro) {
        setMensagem(erro.message);
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, []);

  function alterar(evento) {
    const { name, value, type, checked } = evento.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  async function salvar(evento) {
    evento.preventDefault();
    setMensagem('');
    setSalvando(true);

    try {
      await atualizarConfiguracoes(formulario);
      setMensagem('Configurações salvas com sucesso.');
    } catch (erro) {
      setMensagem(erro.message);
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return <p className="text-center mt-10">Carregando configurações...</p>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link
        to="/admin"
        className="text-blue-600 hover:underline text-sm"
      >
        &larr; Voltar ao painel
      </Link>

      <h1 className="text-2xl font-bold mt-2 mb-6">Configurações da loja</h1>

      <form
        onSubmit={salvar}
        className="bg-white rounded-lg shadow p-6 space-y-4"
      >
        <input
          type="tel"
          name="whatsapp"
          value={formulario.whatsapp}
          onChange={alterar}
          placeholder="WhatsApp de suporte"
          className="w-full border p-2 rounded"
        />

        <input
          type="email"
          name="email_suporte"
          value={formulario.email_suporte}
          onChange={alterar}
          placeholder="E-mail de suporte"
          className="w-full border p-2 rounded"
        />

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="aviso_ativo"
            checked={formulario.aviso_ativo}
            onChange={alterar}
          />
          Exibir aviso no topo da loja
        </label>

        <input
          type="text"
          name="aviso_texto"
          value={formulario.aviso_texto}
          onChange={alterar}
          placeholder="Texto do aviso"
          className="w-full border p-2 rounded"
        />

        <input
          type="number"
          min="0"
          step="0.01"
          name="frete_fixo"
          value={formulario.frete_fixo}
          onChange={alterar}
          placeholder="Frete fixo"
          className="w-full border p-2 rounded"
        />

        <input
          type="url"
          name="banner_url"
          value={formulario.banner_url}
          onChange={alterar}
          placeholder="URL do banner"
          className="w-full border p-2 rounded"
        />

        <input
          type="text"
          name="banner_titulo"
          value={formulario.banner_titulo}
          onChange={alterar}
          placeholder="Título do banner"
          className="w-full border p-2 rounded"
        />

        <input
          type="url"
          name="banner_link"
          value={formulario.banner_link}
          onChange={alterar}
          placeholder="Link do banner"
          className="w-full border p-2 rounded"
        />

        <textarea
          name="politica_devolucao"
          value={formulario.politica_devolucao}
          onChange={alterar}
          placeholder="Política de devolução"
          rows="6"
          className="w-full border p-2 rounded"
        />

        <button
          type="submit"
          disabled={salvando}
          className="bg-black text-white px-5 py-2 rounded disabled:opacity-50"
        >
          {salvando ? 'Salvando...' : 'Salvar'}
        </button>

        {mensagem && <p className="text-sm">{mensagem}</p>}
      </form>
    </div>
  );
}