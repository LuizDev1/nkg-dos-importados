import { useEffect, useState } from 'react';
import { criarEndereco, definirEnderecoPrincipal, listarEnderecos, removerEndereco } from '../servicos/enderecoService';
import { formatarCep, formatarTelefone } from '../servicos/formatadores.mjs';
import Botao from './ui/Botao';
import Campo from './ui/Campo';

const vazio = { apelido: 'Casa', cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', telefone: '', principal: false };
// [campo, rótulo, autocomplete, inputMode, type]
const CAMPOS = [
  ['apelido', 'Apelido', 'off'], ['cep', 'CEP', 'postal-code', 'numeric'], ['rua', 'Rua', 'address-line1'],
  ['numero', 'Número', 'off', 'numeric'], ['complemento', 'Complemento', 'address-line2'], ['bairro', 'Bairro', 'address-level3'],
  ['cidade', 'Cidade', 'address-level2'], ['estado', 'UF', 'address-level1'], ['telefone', 'Telefone', 'tel', 'tel', 'tel'],
];
const OPCIONAIS = ['complemento', 'telefone'];

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
  function alterar(campo, valorDigitado) {
    const valor = campo === 'cep' ? formatarCep(valorDigitado) : campo === 'telefone' ? formatarTelefone(valorDigitado) : campo === 'estado' ? valorDigitado.replace(/[^a-z]/gi, '').slice(0, 2).toUpperCase() : valorDigitado;
    setForm({ ...form, [campo]: valor });
  }
  return <section className="mt-8 border-t border-borda pt-6" aria-labelledby="titulo-enderecos">
    <h2 id="titulo-enderecos" className="text-lg font-semibold">Endereços de entrega</h2><p className="mt-1 text-sm text-texto-secundario">O endereço principal será sugerido no checkout.</p>
    <div role="alert" className={erro ? 'mt-3 text-sm text-erro' : ''}>{erro}</div>
    <div className="mt-4 space-y-3">{enderecos.map((endereco) => (
      <article key={endereco.id} className="rounded-cartao border border-borda bg-campo p-4 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <strong>{endereco.apelido}{endereco.principal ? ' · Principal' : ''}</strong>
          <div className="flex flex-wrap gap-2">
            <Botao variante="discreto" tamanho="sm" onClick={() => tornarPrincipal(endereco)} disabled={Boolean(endereco.principal)} aria-label={`Tornar principal o endereço ${endereco.apelido}`}>Tornar principal</Botao>
            <Botao variante="destrutivo" tamanho="sm" onClick={() => remover(endereco)} aria-label={`Remover o endereço ${endereco.apelido}`}>Remover</Botao>
          </div>
        </div>
        <p className="mt-2 text-texto-secundario">{endereco.rua}, {endereco.numero}{endereco.complemento ? ` — ${endereco.complemento}` : ''}<br />{endereco.bairro}, {endereco.cidade} - {endereco.estado} · CEP {endereco.cep}</p>
      </article>
    ))}</div>
    <form onSubmit={salvar} className="mt-5 grid gap-3 sm:grid-cols-2" aria-label="Novo endereço">
      {CAMPOS.map(([campo, rotulo, autocomplete, modo, tipo]) => (
        <Campo
          key={campo}
          id={`endereco-${campo}`}
          rotulo={rotulo}
          opcional={OPCIONAIS.includes(campo)}
          name={campo}
          type={tipo || 'text'}
          autoComplete={autocomplete}
          inputMode={modo}
          required={!OPCIONAIS.includes(campo)}
          maxLength={campo === 'cep' ? 9 : campo === 'telefone' ? 15 : campo === 'estado' ? 2 : undefined}
          value={form[campo]}
          onChange={(e) => alterar(campo, e.target.value)}
          className={campo === 'rua' ? 'sm:col-span-2' : ''}
        />
      ))}
      <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" name="principal" checked={form.principal} onChange={e => setForm({ ...form, principal: e.target.checked })} /> Definir como endereço principal</label>
      <Botao type="submit" carregando={salvando} className="sm:col-span-2">{salvando ? 'Salvando...' : 'Salvar endereço'}</Botao>
    </form>
  </section>;
}
