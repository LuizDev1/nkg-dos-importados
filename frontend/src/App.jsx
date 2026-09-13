import { Routes, Route } from 'react-router-dom';
import Login from './paginas/publicas/Login';
import Cadastro from './paginas/publicas/Cadastro';
import Home from './paginas/publicas/Home';
import Carrinho from './paginas/publicas/Carrinho';
import Checkout from './paginas/publicas/Checkout';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/carrinho" element={<Carrinho />} />
      <Route path="/checkout" element={<Checkout />} />
    </Routes>
  );
}

export default App;