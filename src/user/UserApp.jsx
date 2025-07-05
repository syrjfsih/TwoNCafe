// File: UserApp.jsx
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Menu from './pages/Menu';
import MenuDetail from './pages/MenuDetail';
import OrderStatus from './pages/OrderStatus';
import BlockedPage from './pages/BlockedPage';
import JamOperasionalGuard from './components/JamOperasionalGuard';

const UserApp = () => (
  <JamOperasionalGuard>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/menu" element={<Menu />} />
      <Route path="/menu/:id" element={<MenuDetail />} />
      <Route path="/status" element={<OrderStatus />} />
      <Route path="/blocked" element={<BlockedPage />} />
    </Routes>
  </JamOperasionalGuard>
);

export default UserApp;
