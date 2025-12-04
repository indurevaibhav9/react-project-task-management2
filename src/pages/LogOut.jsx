import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUserData, setUserRole, setToken } from '../slices/authSlice';

const LogOut = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    // Clear Redux state
    dispatch(setUserData(null));
    dispatch(setUserRole(null));
    dispatch(setToken(null));

    // Clear localStorage
    localStorage.removeItem('userData');
    localStorage.removeItem('userRole');
    localStorage.removeItem('token');

    // Redirect to login after a brief delay for UX
    const timer = setTimeout(() => {
      navigate('/login');
    }, 500);

    return () => clearTimeout(timer);
  }, [dispatch, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Logging Out...</h2>
        <p className="text-gray-600">You will be redirected shortly.</p>
        <div className="mt-6 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    </div>
  );
};

export default LogOut;
