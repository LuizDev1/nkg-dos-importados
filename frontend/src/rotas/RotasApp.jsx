import { Navigate, Routes, Route } from 'react-router-dom';
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
import ConfiguracaoLoja from '../paginas/admin/configuracaoLoja';
import Clientes from '../paginas/admin/Clientes';
import DetalheCliente from '../paginas/admin/DetalheCliente';
import DetalhePedido from '../paginas/admin/DetalhePedido';
import Promocoes from '../paginas/admin/Promocoes';
import Banners from '../paginas/admin/Banners';
import MeusPedidosCliente from '../paginas/cliente/MeusPedidos';
import DetalheMeuPedido from '../paginas/cliente/DetalheMeuPedido';
import Privacidade from '../paginas/publicas/Privacidade';

export default function RotasApp() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route
        path="/carrinho"
        element={
          <RotaPrivada somenteCliente>
            <Carrinho />
          </RotaPrivada>
        }
      />
      <Route
        path="/checkout"
        element={
          <RotaPrivada somenteCliente>
            <Checkout />
          </RotaPrivada>
        }
      />
      <Route path="/produto/:id" element={<DetalheProduto />} />
      <Route path="/pedido/:id/:resultado" element={<StatusPedido />} />
      <Route
        path="/meus-pedidos"
        element={<Navigate to="/minha-conta/pedidos" replace />}
      />
      <Route
        path="/privacidade"
        element={
          <RotaPrivada somenteCliente>
            <Privacidade />
          </RotaPrivada>
        }
      />

      <Route
        path="/minha-conta/pedidos"
        element={
          <RotaPrivada>
            <MeusPedidosCliente />
          </RotaPrivada>
        }
      />
      <Route
        path="/minha-conta/pedidos/:id"
        element={
          <RotaPrivada>
            <DetalheMeuPedido />
          </RotaPrivada>
        }
      />
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
      <Route
        path="/admin/configuracoes"
        element={
          <RotaPrivada somenteAdmin>
            <ConfiguracaoLoja />
          </RotaPrivada>
        }
      />
      <Route
        path="/admin/promocoes"
        element={
          <RotaPrivada somenteAdmin>
            <Promocoes />
          </RotaPrivada>
        }
      />
      <Route
        path="/admin/banners"
        element={
          <RotaPrivada somenteAdmin>
            <Banners />
          </RotaPrivada>
        }
      />
      <Route
        path="/admin/clientes"
        element={
          <RotaPrivada somenteAdmin>
            <Clientes />
          </RotaPrivada>
        }
      />
      <Route
        path="/admin/clientes/:id"
        element={
          <RotaPrivada somenteAdmin>
            <DetalheCliente />
          </RotaPrivada>
        }
      />
      <Route
        path="/admin/pedidos/:id"
        element={
          <RotaPrivada somenteAdmin>
            <DetalhePedido />
          </RotaPrivada>
        }
      />
    </Routes>
  );
}
