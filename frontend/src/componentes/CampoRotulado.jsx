import { useId } from 'react';

export default function CampoRotulado({ rotulo, as: Elemento = 'input', containerClassName = '', ...props }) {
  const idGerado = useId();
  const id = props.id || idGerado;
  return (
    <div className={`min-w-0 ${containerClassName}`}>
      <label htmlFor={id} className="mb-2 block text-sm text-[#aaa399]">{rotulo}</label>
      <Elemento {...props} id={id} className={`w-full ${props.className || ''}`} />
    </div>
  );
}
