import { Routes, Route } from 'react-router-dom';
import Login from '../paginas/publicas/Login';
import Cadastro from '../paginas/publicas/Cadastro';
import Home from '../paginas/publicas/Home';
import Carrinho from '../paginas/publicas/Carrinho';
import Checkout from '../paginas/publicas/Checkout';
import DetalheProduto from '../paginas/publicas/DetalheProduto';
import StatusPedido from '../paginas/publicas/StatusPedido';
import Painel from '../paginas/admin/Painel';
import Produtos from '../paginas/admin/Produtos';
import Pedidos from '../paginas/admin/Pedidos';
import Relatorios from '../paginas/admin/Relatorios';
import RotaPrivada from './RotaPrivada';

export default function RotasApp() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/carrinho" element={<Carrinho />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/produto/:id" element={<DetalheProduto />} />
      <Route path="/pedido/:id/:resultado" element={<StatusPedido />} />

      <Route
        path="/admin"
        element={
          <RotaPrivada somenteAdmin>
            <Painel />
          </RotaPrivada>
        }
      />
      <Route
        path="/admin/produtos"
        element={
          <RotaPrivada somenteAdmin>
            <Produtos />
          </RotaPrivada>
        }
      />
      <Route
        path="/admin/pedidos"
        element={
          <RotaPrivada somenteAdmin>
            <Pedidos />
          </RotaPrivada>
        }
      />
      <Route
        path="/admin/relatorios"
        element={
          <RotaPrivada somenteAdmin>
            <Relatorios />
          </RotaPrivada>
        }
      />
    </Routes>
  );
}
