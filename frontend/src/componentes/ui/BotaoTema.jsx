import { useRef } from 'react';
import { useTema } from '../../contextos/ContextoTema.jsx';
import { IconeLua, IconeSol, veioDoPonteiro } from '../icones/animados/IconesAnimados.jsx';
import { classesBotaoIcone } from './estilos.mjs';

// Alterna claro e escuro. O nome diz o que o clique faz; aria-pressed não é usado porque o rótulo já muda.
// O ícone mostrado é o do tema atual; o pulso só acontece em clique de ponteiro (teclado não anima).
export default function BotaoTema({ tamanho = 'lg', className = '' }) {
  const { tema, alternar } = useTema();
  const sol = useRef(null);
  const lua = useRef(null);
  const escuro = tema === 'escuro';
  const nome = escuro ? 'Ativar tema claro' : 'Ativar tema escuro';

  const aoClicar = (evento) => {
    alternar();
    if (veioDoPonteiro(evento)) (escuro ? sol : lua).current?.pulsar();
  };

  return (
    <button
      type="button"
      aria-label={nome}
      title={nome}
      onClick={aoClicar}
      className={`${classesBotaoIcone({ tamanho, variante: 'fantasma' })} ${className}`.trim()}
    >
      <span className="icone-tema" aria-hidden="true">
        <IconeSol ref={sol} data-ativo={String(!escuro)} />
        <IconeLua ref={lua} data-ativo={String(escuro)} />
      </span>
    </button>
  );
}
