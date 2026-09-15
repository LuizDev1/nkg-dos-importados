import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { atualizarBanner, criarBanner, excluirBanner, listarBannersAdmin } from '../../servicos/bannerService';

const VAZIO = { titulo: '', imagem_url: '', link_url: '', ativo: true, ordem: 0 };

export default function Banners() {
  const [banners, setBanners] = useState([]);
  const [form, setForm] = useState(VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    try { setBanners(await listarBannersAdmin()); } catch (e) { setErro(e.message); }
  }

  useEffect(() => { carregar(); }, []);

  async function salvar(evento) {
    evento.preventDefault();
    setSalvando(true);
    setErro('');
    try {
      const dados = { ...form, ordem: Number(form.ordem) };
      if (editandoId) await atualizarBanner(editandoId, dados);
      else await criarBanner(dados);
      setForm(VAZIO);
      setEditandoId(null);
      await carregar();
    } catch (e) { setErro(e.message); } finally { setSalvando(false); }
  }

  function editar(banner) {
    setEditandoId(banner.id);
    setForm({
      titulo: banner.titulo || '', imagem_url: banner.imagem_url,
      link_url: banner.link_url || '', ativo: Boolean(banner.ativo), ordem: banner.ordem,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function excluir(id) {
    if (!window.confirm('Excluir este banner permanentemente?')) return;
    try { await excluirBanner(id); await carregar(); } catch (e) { setErro(e.message); }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link to="/admin" className="text-sm text-blue-600 hover:underline">&larr; Voltar ao painel</Link>
      <h1 className="mb-6 mt-2 text-2xl font-bold">Banners</h1>
      {erro && <p className="mb-4 rounded bg-red-50 p-3 text-red-600">{erro}</p>}

      <form onSubmit={salvar} className="mb-8 grid gap-3 rounded-lg bg-white p-5 shadow sm:grid-cols-2">
        <input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Título" maxLength="150" className="rounded border p-2" />
        <input type="number" min="0" value={form.ordem} onChange={(e) => setForm({ ...form, ordem: e.target.value })} placeholder="Ordem" className="rounded border p-2" />
        <input type="url" required value={form.imagem_url} onChange={(e) => setForm({ ...form, imagem_url: e.target.value })} placeholder="URL da imagem" className="rounded border p-2 sm:col-span-2" />
        <input type="url" value={form.link_url} onChange={(e) => setForm({ ...form, link_url: e.target.value })} placeholder="Link ao clicar (opcional)" className="rounded border p-2 sm:col-span-2" />
        <label className="flex items-center gap-2"><input type="checkbox" checked={form.ativo} onChange={(e) => setForm({ ...form, ativo: e.target.checked })} /> Banner ativo</label>
        <div className="flex justify-end gap-2">
          {editandoId && <button type="button" onClick={() => { setEditandoId(null); setForm(VAZIO); }} className="rounded border px-4 py-2">Cancelar</button>}
          <button disabled={salvando} className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50">{salvando ? 'Salvando...' : editandoId ? 'Salvar alterações' : 'Criar banner'}</button>
        </div>
      </form>

      <div className="grid gap-5 sm:grid-cols-2">
        {banners.map((banner) => (
          <article key={banner.id} className="overflow-hidden rounded-lg bg-white shadow">
            <img src={banner.imagem_url} alt={banner.titulo || 'Banner'} className="h-40 w-full object-cover" />
            <div className="p-4">
              <div className="flex justify-between gap-3"><strong>{banner.titulo || 'Sem título'}</strong><span className={banner.ativo ? 'text-green-600' : 'text-gray-500'}>{banner.ativo ? 'Ativo' : 'Inativo'}</span></div>
              <p className="mt-1 text-sm text-gray-500">Ordem: {banner.ordem}</p>
              <div className="mt-4 flex gap-4"><button onClick={() => editar(banner)} className="text-blue-600 hover:underline">Editar</button><button onClick={() => excluir(banner.id)} className="text-red-600 hover:underline">Excluir</button></div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
