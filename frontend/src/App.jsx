import Cabecalho from './componentes/Cabecalho';
import Rodape from './componentes/Rodape';
import AvisoAdmin from './componentes/AvisoAdmin';
import RotasApp from './rotas/RotasApp';
import { useLocation } from 'react-router-dom';

function App() {
  const location = useLocation();
  const areaAdmin = location.pathname.startsWith('/admin');

  return (
    <div className={`site-shell min-h-screen flex flex-col text-[#f4efe5] ${areaAdmin ? 'admin-area' : ''}`}>
      <Cabecalho />
      <main className="flex-1">
        <RotasApp />
      </main>
      <Rodape />
      {areaAdmin && <AvisoAdmin />}
    </div>
  );
}

export default App;
