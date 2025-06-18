import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import AdminApp from './admin/AdminApp';
import UserApp from './user/UserApp';

function App() {
  return (
    <>
    <Router>
      <Routes>
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="/*" element={<UserApp />} />
      </Routes>
    </Router>
    <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;
