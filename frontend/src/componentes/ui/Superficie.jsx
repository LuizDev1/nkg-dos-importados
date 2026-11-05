import { classesSuperficie } from './estilos.mjs';

// Superfície estática para painéis e agrupamentos. Não é clicável: o card interativo é um link com nome próprio.
export default function Superficie({ as: Elemento = 'div', nivel = 'base', espacamento = 'padrao', borda = true, sombra = false, className = '', children, ...props }) {
  return (
    <Elemento className={`${classesSuperficie({ nivel, espacamento, borda, sombra })} ${className}`.trim()} {...props}>
      {children}
    </Elemento>
  );
}
