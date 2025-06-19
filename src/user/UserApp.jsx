import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Checkout from './pages/Checkout';
import OrderStatus from './pages/OrderStatus';
import BlockedPage from './pages/BlockedPage';

const UserApp = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path='/menu' element={<Menu />} />
    <Route path="/checkout" element={<Checkout />} />
    <Route path="/status" element={<OrderStatus />} />
    <Route path="/blocked" element={<BlockedPage />} />
  </Routes>
);

export default UserApp;
