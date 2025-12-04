import React, { useState } from 'react';
import { Mail, User, Lock, Shield, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getOtp } from '../services/operations/authAPI';
import { register } from '../services/operations/authAPI';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    role: 'Employee'
  });
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGetOtp = async () => {
    // Validate form fields
    if (!formData.email || !formData.username || !formData.password) {
      setMessage('Please fill in all fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setMessage('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setMessage('');
    // Simulate sending OTP
    await getOtp({email:formData.email,username:formData.username,password:formData.password,role:formData.role,navigate})();
    setOtpSent(true);
    setLoading(false);
    setMessage(`OTP sent to ${formData.email}`);
  };

  const handleRegister = async () => {
    if (otp.length !== 6) {
      setMessage('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setMessage('');
    
    const response = await register({ email: formData.email, otp,navigate})();
    // Simulate registration
    setLoading(false);
    setMessage('Registration successful!');
  };

  return (
    <div className="w-screen min-h-[calc(100vh-80px)] bg-linear-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-screen max-w-xl">
        <div className="bg-white border-2 border-black px-16 py-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-lg ">
          {/* Email Input */}
          <div className="text-left mb-8">
            <h1 className="text-4xl font-bold text-black mb-2">Register</h1>
            <p className="text-gray-800">Register to get started...</p>
          </div>
          <div className="mb-6 ">
            <label className="block text-lg font-medium  text-black mb-2">
              Email Address
            </label>
            <div className="relative ">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full rounded-lg pl-12 pr-4 py-3 border-2 border-black focus:outline-none focus:ring-0 bg-white text-black"
                placeholder="your@email.com"
                disabled={otpSent}
              />
            </div>
          </div>

          {/* Username Input */}
          <div className="mb-6">
            <label className="block text-lg font-medium  text-black mb-2">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full rounded-lg pl-12 pr-4 py-3 border-2 border-black focus:outline-none focus:ring-0 bg-white text-black"
                placeholder="username"
                disabled={otpSent}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="mb-6">
            <label className="block text-lg font-medium  text-black mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full rounded-lg pl-12 pr-4 py-3 border-2 border-black focus:outline-none focus:ring-0 bg-white text-black"
                placeholder="••••••••"
                disabled={otpSent}
              />
            </div>
          </div>

          {/* Role Dropdown */}
          <div className="mb-6">
            <label className="block text-lg font-medium text-black mb-2">
              Role
            </label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" />
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full rounded-lg pl-12 pr-4 py-3 border-2 border-black focus:outline-none focus:ring-0 bg-white text-black appearance-none cursor-pointer"
                disabled={otpSent}
              >
                <option value="Employee">Employee</option>
                <option value="Manager">Manager</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* OTP Input (shown after clicking Get OTP) */}
          {otpSent && (
            <div className="mb-6 animate-fadeIn">
              <label className="block text-md font-medium text-black mb-2">
                Enter OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full rounded-lg px-4 py-3 border-2 border-black focus:outline-none focus:ring-0 bg-white text-black text-center text-2xl tracking-widest font-mono"
                placeholder="000000"
                maxLength={6}
              />
            </div>
          )}

          {/* Message */}
          {message && (
            <div className={`mb-6 rounded-lg p-3 border-2 border-black ${
              message.includes('successful') ? 'bg-white' : 'bg-gray-100'
            }`}>
              <p className="text-sm text-red-600 font-medium flex items-center gap-2">
                {message.includes('successful') && <CheckCircle className="w-4 h-4" />}
                {message}
              </p>
            </div>
          )}

          {/* Buttons */}
          {!otpSent ? (
            <button
              onClick={handleGetOtp}
              disabled={loading}
              className="w-full rounded-lg py-3 bg-black text-white font-bold border-2 border-black hover:bg-white hover:text-black transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]"
            >
              {loading ? 'Sending OTP...' : 'Get OTP'}
            </button>
          ) : (
            <button
              onClick={handleRegister}
              disabled={loading || otp.length !== 6}
              className="w-full rounded-lg cursor-pointer py-3 bg-black text-white font-bold border-2 border-black hover:bg-white hover:text-black transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          )}

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-black font-bold underline hover:no-underline">Log In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;