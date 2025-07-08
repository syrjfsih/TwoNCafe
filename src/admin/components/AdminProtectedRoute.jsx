import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../../services/supabase';

const AdminProtectedRoute = () => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setLoading(false);
    };
    checkSession();
  }, []);

  if (loading) return null;

  // Jika belum login, arahkan ke halaman login admin
  return isAuthenticated ? <Outlet /> : <Navigate to="/admin/login" />;
};

export default AdminProtectedRoute;
