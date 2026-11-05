import { classesBotaoIcone } from './estilos.mjs';

// Botão só de ícone. `rotulo` é obrigatório e vira o nome acessível; o ícone fica oculto para leitores de tela.
export default function BotaoIcone({ rotulo, tamanho = 'md', variante = 'neutro', pressionado, className = '', children, type = 'button', ...props }) {
  return (
    <button
      type={type}
      aria-label={rotulo}
      aria-pressed={pressionado}
      className={`${classesBotaoIcone({ tamanho, variante })} ${className}`.trim()}
      {...props}
    >
      <span aria-hidden="true" className="inline-flex">{children}</span>
    </button>
  );
}
