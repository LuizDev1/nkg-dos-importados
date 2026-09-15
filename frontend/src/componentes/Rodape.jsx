import { useEffect, useState } from 'react';
import { buscarConfiguracoes } from '../servicos/configuracaoService';
import { Link } from 'react-router-dom';

export default function Rodape() {
  const [configuracoes, setConfiguracoes] = useState({});

  useEffect(() => {
    buscarConfiguracoes()
      .then(setConfiguracoes)
      .catch(() => {});
  }, []);

  const whatsapp = String(configuracoes.whatsapp || '').replace(/\D/g, '');

  return (
    <footer className="mt-12 bg-[#090a09]">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm text-gray-500 sm:grid-cols-3">
        <div>
          <Link to="/" className="text-lg font-black uppercase tracking-[0.12em] text-[#d4af45]">
            NKG <span>dos Importados</span>
          </Link>
          <p className="mt-3 max-w-xs leading-6">Produtos selecionados, compra segura e entrega para todo o Brasil.</p>
        </div>

        <div className="flex flex-col items-start gap-2">
          <h2 className="mb-1 font-semibold uppercase tracking-wider text-[#f4efe5]">Atendimento</h2>
          {whatsapp && (
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="text-[#c6c0b5] hover:text-[#d4af45] hover:underline"
            >
              WhatsApp: {configuracoes.whatsapp}
            </a>
          )}

          {configuracoes.email_suporte && (
            <a
              href={`mailto:${configuracoes.email_suporte}`}
              className="text-blue-600 hover:underline"
            >
              E-mail: {configuracoes.email_suporte}
            </a>
          )}
        </div>

        <div className="flex flex-col items-start gap-2">
          <h2 className="mb-1 font-semibold uppercase tracking-wider text-[#f4efe5]">Institucional</h2>
          <Link to="/privacidade" className="text-blue-600 hover:underline">Privacidade e dados pessoais</Link>
        </div>
      </div>
      <div className="px-4 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} NKG dos Importados. Todos os direitos reservados.
      </div>
    </footer>
  );
}
