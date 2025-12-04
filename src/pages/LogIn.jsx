import React, { use, useState } from 'react';
import { useDispatch } from 'react-redux'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/operations/authAPI';

const LogIn = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setMessage('Please fill in all fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setMessage('');
    var check = await login({email,password,navigate})(dispatch);
    if(!check){
      setLoading(false);
      setMessage('Invalid Input! Login Unsuccessful!');
    }
    else{
      setLoading(false);
      setMessage('Login successful!');
    }
    
  };

  return (
    <div className="w-screen min-h-[calc(100vh-80px)] bg-linear-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-xl ">
        <div className="bg-white border-2 border-black px-16 py-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-lg">
           <div className=" mb-8">
            <h1 className="text-4xl font-bold text-black mb-2">Log In</h1>
            <p className="text-gray-600">Welcome back</p>
          </div>
          <div className="mb-6">
            <label htmlFor="email" className="block text-lg font-medium text-black mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg pl-12 pr-4 py-3 border-2 border-black focus:outline-none bg-white text-black"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-lg font-medium text-black mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg pl-12 pr-12 py-3 border-2 border-black focus:outline-none bg-white text-black"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute  right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-black"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {message && (
            <div className={`mb-6 p-3 border-2 border-black ${
              message.includes('successful') ? 'bg-white' : 'bg-gray-100'
            }`}>
              <p className="text-sm text-black font-medium">{message}</p>
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full rounded-lg cursor-pointer py-3 bg-black text-white font-bold border-2 border-black hover:bg-white hover:text-black transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]"
          >
            {loading ? 'Logging In...' : 'Login'}
          </button>

          <div className="mt-6 text-center">
            <Link to="/forgot-password" className="text-sm text-gray-600 hover:text-black underline ml-2">
              Forgot password?
            </Link>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-black font-bold underline hover:no-underline">Register</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogIn;