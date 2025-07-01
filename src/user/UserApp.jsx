import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Menu from './pages/Menu';
import MenuDetail from './pages/MenuDetail'
import OrderStatus from './pages/OrderStatus';
import BlockedPage from './pages/BlockedPage';

const UserApp = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path='/menu' element={<Menu />} />
    <Route path="/menudetail" element={<MenuDetail />} />
    <Route path="/status" element={<OrderStatus />} />
    <Route path="/blocked" element={<BlockedPage />} />
  </Routes>
);

export default UserApp;
