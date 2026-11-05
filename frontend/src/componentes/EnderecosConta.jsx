import { useEffect, useState } from 'react';
import { criarEndereco, definirEnderecoPrincipal, listarEnderecos, removerEndereco } from '../servicos/enderecoService';
import { formatarCep, formatarTelefone } from '../servicos/formatadores';

const vazio = { apelido: 'Casa', cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', telefone: '', principal: false };
// [campo, rótulo, autocomplete, inputMode, type]
const CAMPOS = [
  ['apelido', 'Apelido', 'off'], ['cep', 'CEP', 'postal-code', 'numeric'], ['rua', 'Rua', 'address-line1'],
  ['numero', 'Número', 'off', 'numeric'], ['complemento', 'Complemento', 'address-line2'], ['bairro', 'Bairro', 'address-level3'],
  ['cidade', 'Cidade', 'address-level2'], ['estado', 'UF', 'address-level1'], ['telefone', 'Telefone', 'tel', 'tel', 'tel'],
];

export default function EnderecosConta() {
  const [enderecos, setEnderecos] = useState([]); const [form, setForm] = useState(vazio); const [erro, setErro] = useState(''); const [salvando, setSalvando] = useState(false);
  const carregar = async () => { try { setEnderecos(await listarEnderecos()); } catch (e) { setErro(e.message); } };
  useEffect(() => { carregar(); }, []);
  async function salvar(e) { e.preventDefault(); setSalvando(true); setErro(''); try { await criarEndereco(form); setForm(vazio); await carregar(); } catch (err) { setErro(err.message); } finally { setSalvando(false); } }
  async function remover(endereco) {
    const resumo = `${endereco.rua}, ${endereco.numero}`;
    if (!window.confirm(`Remover o endereço "${endereco.apelido}" (${resumo})? Ele deixará de aparecer no checkout.`)) return;
    setErro('');
    try { await removerEndereco(endereco.id); await carregar(); } catch (err) { setErro(err.message); }
  }
  async function tornarPrincipal(endereco) {
    setErro('');
    try { await definirEnderecoPrincipal(endereco.id); await carregar(); } catch (err) { setErro(err.message); }
  }
  return <section className="mt-8 border-t border-[#343024] pt-6" aria-labelledby="titulo-enderecos">
    <h2 id="titulo-enderecos" className="text-lg font-semibold">Endereços de entrega</h2><p className="mt-1 text-sm text-[#aaa399]">O endereço principal será sugerido no checkout.</p>
    <div role="alert" className={erro ? 'mt-3 text-sm text-erro' : ''}>{erro}</div>
    <div className="mt-4 space-y-3">{enderecos.map((endereco) => <article key={endereco.id} className="rounded border border-[#343024] bg-[#151613] p-4 text-sm"><div className="flex flex-wrap justify-between gap-3"><strong>{endereco.apelido}{endereco.principal ? ' · Principal' : ''}</strong><div className="flex gap-4"><button type="button" onClick={() => tornarPrincipal(endereco)} disabled={Boolean(endereco.principal)} aria-label={`Tornar principal o endereço ${endereco.apelido}`} className="text-[#d4af45] disabled:opacity-50">Tornar principal</button><button type="button" onClick={() => remover(endereco)} aria-label={`Remover o endereço ${endereco.apelido}`} className="text-erro">Remover</button></div></div><p className="mt-2 text-[#c6c0b5]">{endereco.rua}, {endereco.numero}{endereco.complemento ? ` — ${endereco.complemento}` : ''}<br />{endereco.bairro}, {endereco.cidade} - {endereco.estado} · CEP {endereco.cep}</p></article>)}</div>
    <form onSubmit={salvar} className="mt-5 grid gap-3 sm:grid-cols-2" aria-label="Novo endereço">{CAMPOS.map(([campo, rotulo, autocomplete, modo, tipo]) => <label key={campo} className={campo === 'rua' ? 'sm:col-span-2' : ''}><span className="mb-1 block text-xs text-[#aaa399]">{rotulo}{['complemento', 'telefone'].includes(campo) ? ' (opcional)' : ''}</span><input name={campo} type={tipo || 'text'} autoComplete={autocomplete} inputMode={modo} required={!['complemento','telefone'].includes(campo)} maxLength={campo === 'cep' ? 9 : campo === 'telefone' ? 15 : campo === 'estado' ? 2 : undefined} value={form[campo]} onChange={e => { const valor = campo === 'cep' ? formatarCep(e.target.value) : campo === 'telefone' ? formatarTelefone(e.target.value) : campo === 'estado' ? e.target.value.replace(/[^a-z]/gi, '').slice(0, 2).toUpperCase() : e.target.value; setForm({ ...form, [campo]: valor }); }} className="w-full rounded border border-[#3a3526] bg-[#151613] px-3 py-2 text-base sm:text-sm" /></label>)}<label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" name="principal" checked={form.principal} onChange={e => setForm({ ...form, principal: e.target.checked })} /> Definir como endereço principal</label><button disabled={salvando} className="rounded bg-[#d4af45] px-4 py-2 font-semibold text-[#090a09] disabled:opacity-50 sm:col-span-2">{salvando ? 'Salvando...' : 'Salvar endereço'}</button></form>
  </section>;
}
