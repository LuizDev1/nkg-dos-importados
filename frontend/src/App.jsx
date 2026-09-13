import Cabecalho from './componentes/Cabecalho';
import Rodape from './componentes/Rodape';
import RotasApp from './rotas/RotasApp';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Cabecalho />
      <main className="flex-1">
        <RotasApp />
      </main>
      <Rodape />
    </div>
  );
}

export default App;
