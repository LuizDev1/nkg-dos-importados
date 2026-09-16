import SeletorFotos from '../../componentes/SeletorFotos';
import { ConteudoBanner } from '../../componentes/CarrosselBanners';
import { corStatus } from '../../servicos/statusVisual';
import CampoRotulado from '../../componentes/CampoRotulado';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { atualizarBanner, criarBanner, excluirBanner, listarBannersAdmin } from '../../servicos/bannerService';
import { avisarAdmin } from '../../utilitarios/avisoAdmin';

const VAZIO = { titulo: '', imagem_url: '', imagem_url_2: '', link_url: '', ativo: true, principal: false, ordem: 0, posicao_x: 50, posicao_y: 50, posicao_x_2: 50, posicao_y_2: 50 };

export default function Banners() {
  const [enviandoFotos, setEnviandoFotos] = useState(false);
  const [banners, setBanners] = useState([]);
  const [form, setForm] = useState(VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [mostrarPrevia, setMostrarPrevia] = useState(false);

  async function carregar() {
    try { setBanners(await listarBannersAdmin()); } catch (e) { setErro(e.message); }
  }

  useEffect(() => { carregar(); }, []);

  function atualizarFotos(fotos) {
    setForm((atual) => {
      const ajustes = [
        { url: atual.imagem_url, x: atual.posicao_x, y: atual.posicao_y },
        { url: atual.imagem_url_2, x: atual.posicao_x_2, y: atual.posicao_y_2 },
      ];
      const primeiro = ajustes.find((item) => item.url === fotos[0]) || { x: 50, y: 50 };
      const segundo = ajustes.find((item) => item.url === fotos[1]) || { x: 50, y: 50 };
      return {
        ...atual, imagem_url: fotos[0] || '', imagem_url_2: fotos[1] || '',
        posicao_x: primeiro.x, posicao_y: primeiro.y,
        posicao_x_2: segundo.x, posicao_y_2: segundo.y,
      };
    });
  }

  async function salvar(evento) {
    evento.preventDefault();
    if (enviandoFotos) return;
    if (!form.imagem_url) { setErro('Selecione a foto do banner.'); return; }
    setSalvando(true);
    setErro('');
    try {
      const dados = { ...form, ordem: Number(form.ordem) };
      if (editandoId) await atualizarBanner(editandoId, dados);
      else await criarBanner(dados);
      setForm(VAZIO);
      setEditandoId(null);
      setMostrarPrevia(false);
      await carregar();
      avisarAdmin(editandoId ? 'Banner atualizado com sucesso.' : 'Banner criado com sucesso.');
    } catch (e) { setErro(e.message); } finally { setSalvando(false); }
  }

  function editar(banner) {
    setEnviandoFotos(false);
    setMostrarPrevia(false);
    setEditandoId(banner.id);
    setForm({
      titulo: banner.titulo || '', imagem_url: banner.imagem_url, imagem_url_2: banner.imagem_url_2 || '',
      link_url: banner.link_url || '', ativo: Boolean(banner.ativo), principal: Boolean(banner.principal), ordem: banner.ordem,
      posicao_x: banner.posicao_x ?? 50, posicao_y: banner.posicao_y ?? 50,
      posicao_x_2: banner.posicao_x_2 ?? 50, posicao_y_2: banner.posicao_y_2 ?? 50,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function excluir(id) {
    if (!window.confirm('Excluir este banner permanentemente?')) return;
    try { await excluirBanner(id); await carregar(); avisarAdmin('Banner excluído com sucesso.'); } catch (e) { setErro(e.message); }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link to="/admin" className="botao-voltar">&larr; Voltar ao painel</Link>
      <h1 className="mb-6 mt-2 text-2xl font-bold">Banners</h1>
      <p className="mb-5 text-sm text-[#aaa396]">Cadastre até duas imagens por banner. Uma imagem ocupa toda a faixa; duas ficam lado a lado. O banner principal aparece primeiro e a troca ocorre a cada 15 segundos.</p>
      <p className="mb-5 text-sm text-[#aaa396]">A faixa desktop tem proporção aproximada de 1920 × 400 px; no celular, 800 × 600 px. Imagens com outra proporção aparecem inteiras, com espaço escuro nas laterais ou acima e abaixo. Confira na prévia.</p>
      {erro && <p className="mb-4 rounded bg-red-50 p-3 text-red-600">{erro}</p>}

      <form onSubmit={salvar} className="mb-8 grid gap-3 rounded-lg bg-white p-5 shadow sm:grid-cols-2">
        <CampoRotulado rotulo="Título" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Título" maxLength="150" className="rounded border p-2" />
        <CampoRotulado rotulo="Ordem" type="number" min="0" value={form.ordem} onChange={(e) => setForm({ ...form, ordem: e.target.value })} placeholder="Ordem" className="rounded border p-2" />
        <div className="sm:col-span-2"><SeletorFotos key={editandoId || 'novo'} rotulo="Imagens ou GIFs do banner (até 2)" maximo={2} limiteMb={20} rotaUpload="imagens/banner" aceitarGif fotos={[form.imagem_url, form.imagem_url_2].filter(Boolean)} disabled={salvando || enviandoFotos} onCarregando={setEnviandoFotos} onChange={atualizarFotos} /></div>
        {form.imagem_url && <div className="sm:col-span-2 rounded border border-[#393323] p-4">
          <button type="button" onClick={() => setMostrarPrevia((atual) => !atual)} aria-expanded={mostrarPrevia} className="rounded border border-[#d4af45] px-4 py-2 text-sm text-[#d4af45] hover:bg-[#29251a]">{mostrarPrevia ? 'Ocultar prévia' : 'Ver prévia para o cliente'}</button>
          {mostrarPrevia && <div className="mt-4">
            <p className="mb-2 text-xs text-[#aaa396]">Desktop</p>
            <div className="overflow-hidden rounded-lg bg-[#090a09] p-3">
              <ConteudoBanner banner={form} modoPrevia="desktop" />
            </div>
            <p className="mb-2 mt-4 text-xs text-[#aaa396]">Celular</p>
            <div className="w-full max-w-xs overflow-hidden rounded-lg bg-[#090a09] p-2">
              <ConteudoBanner banner={form} modoPrevia="celular" />
            </div>
            <p className="mt-3 text-xs text-gray-500">A prévia mostra a imagem inteira dentro da faixa. No celular, a primeira imagem aparece sozinha.</p>
          </div>}
          <p className="mt-4 text-sm font-semibold">Ajuste o enquadramento</p>
          {[form.imagem_url, form.imagem_url_2].filter(Boolean).map((url, indice) => {
            const campoX = indice ? 'posicao_x_2' : 'posicao_x';
            const campoY = indice ? 'posicao_y_2' : 'posicao_y';
            return <div key={url} className="mt-4 grid gap-3 sm:grid-cols-2">
              <p className="font-semibold sm:col-span-2">Imagem {indice + 1}</p>
              <label className="text-sm">Horizontal: {form[campoX]}%<input type="range" min="0" max="100" value={form[campoX]} onChange={e => setForm(atual => ({ ...atual, [campoX]: Number(e.target.value) }))} className="mt-2 w-full accent-[#d4af45]" /></label>
              <label className="text-sm">Vertical: {form[campoY]}%<input type="range" min="0" max="100" value={form[campoY]} onChange={e => setForm(atual => ({ ...atual, [campoY]: Number(e.target.value) }))} className="mt-2 w-full accent-[#d4af45]" /></label>
            </div>;
          })}
        </div>}
        <CampoRotulado rotulo="Link ao clicar (opcional)" containerClassName="sm:col-span-2" type="url" value={form.link_url} onChange={(e) => setForm({ ...form, link_url: e.target.value })} placeholder="Link ao clicar (opcional)" className="rounded border p-2" />
        <div className="flex flex-wrap items-center gap-5">
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.ativo} onChange={(e) => setForm({ ...form, ativo: e.target.checked })} /> Banner ativo</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.principal} onChange={(e) => setForm({ ...form, principal: e.target.checked })} /> Banner principal</label>
        </div>
        <div className="flex justify-end gap-2">
          {Boolean(editandoId) && <button type="button" onClick={() => { setEnviandoFotos(false); setEditandoId(null); setForm(VAZIO); setMostrarPrevia(false); }} className="rounded border px-4 py-2">Cancelar</button>}
          <button disabled={salvando} className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50">{salvando ? 'Salvando...' : editandoId ? 'Salvar alterações' : 'Criar banner'}</button>
        </div>
      </form>

      <div className="grid gap-5 sm:grid-cols-2">
        {banners.map((banner) => (
          <article key={banner.id} className="overflow-hidden rounded-lg bg-white shadow">
            <div className={`grid ${banner.imagem_url_2 ? 'grid-cols-2' : ''}`}>
              <img src={banner.imagem_url} alt={banner.titulo || 'Banner'} className="h-40 w-full object-cover" style={{ objectPosition: `${banner.posicao_x ?? 50}% ${banner.posicao_y ?? 50}%` }} />
              {banner.imagem_url_2 && <img src={banner.imagem_url_2} alt={`Segunda imagem de ${banner.titulo || 'banner'}`} className="h-40 w-full object-cover" style={{ objectPosition: `${banner.posicao_x_2 ?? 50}% ${banner.posicao_y_2 ?? 50}%` }} />}
            </div>
            <div className="p-4">
              <div className="flex justify-between gap-3"><strong>{banner.titulo || 'Sem título'}</strong><span className={corStatus(banner.ativo ? 'ativo' : 'inativo')}>{banner.ativo ? 'Ativo' : 'Inativo'}</span></div>
              {Boolean(banner.principal) && <p className="mt-1 text-sm font-semibold text-[#d4af45]">Principal</p>}
              <p className="mt-1 text-sm text-gray-500">Ordem: {banner.ordem}</p>
              <div className="mt-4 flex gap-4"><button onClick={() => editar(banner)} className="text-blue-600 hover:underline">Editar</button><button onClick={() => excluir(banner.id)} className="text-red-600 hover:underline">Excluir</button></div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
