import { LoaderCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { classesBotao } from './estilos.mjs';

// Botão base. Com `para` vira <Link> (navegação interna); com `href`, <a>; senão, <button type="button">.
// `carregando` desabilita e marca aria-busy; o texto de carregamento continua sendo decidido por quem chama.
export default function Botao({
  variante = 'primario', tamanho = 'md', larguraTotal = false, carregando = false,
  iconeAntes = null, iconeDepois = null, para, href, type = 'button', disabled = false,
  className = '', children, ...props
}) {
  const classes = `${classesBotao({ variante, tamanho, larguraTotal })} ${className}`.trim();
  const conteudo = (
    <>
      {carregando && <LoaderCircle aria-hidden="true" size={16} className="shrink-0 animate-spin motion-reduce:animate-none" />}
      {!carregando && iconeAntes && <span aria-hidden="true" className="inline-flex shrink-0">{iconeAntes}</span>}
      {children}
      {iconeDepois && <span aria-hidden="true" className="inline-flex shrink-0">{iconeDepois}</span>}
    </>
  );

  if (para) return <Link to={para} className={classes} {...props}>{conteudo}</Link>;
  if (href) return <a href={href} className={classes} {...props}>{conteudo}</a>;
  return (
    <button type={type} disabled={disabled || carregando} aria-busy={carregando || undefined} className={classes} {...props}>
      {conteudo}
    </button>
  );
}
