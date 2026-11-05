import Campo from './ui/Campo';

// Compatibilidade: mesma API usada no admin, agora sobre o componente base Campo.
// O `className` antigo era só estilo do controle (ex.: "border rounded px-2 py-1") e passa a vir do Campo.
// eslint-disable-next-line no-unused-vars
export default function CampoRotulado({ rotulo, containerClassName = '', className, ...props }) {
  return <Campo rotulo={rotulo} className={containerClassName} {...props} />;
}
