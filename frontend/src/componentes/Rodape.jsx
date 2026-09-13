import { useEffect, useState } from 'react';
import { buscarConfiguracoes } from '../servicos/configuracaoService';

export default function Rodape() {
  const [configuracoes, setConfiguracoes] = useState({});

  useEffect(() => {
    buscarConfiguracoes()
      .then(setConfiguracoes)
      .catch(() => {});
  }, []);

  const whatsapp = String(configuracoes.whatsapp || '').replace(/\D/g, '');

  return (
    <footer className="bg-white border-t mt-12">
      <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
        <div className="flex flex-col gap-2 mb-4">
          {whatsapp && (
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="text-green-600 hover:underline"
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

        © {new Date().getFullYear()} NKG dos Importados. Todos os direitos
        reservados.
      </div>
    </footer>
  );
}