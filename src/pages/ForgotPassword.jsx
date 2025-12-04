import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { forgotPassword,resetPassword } from '../services/operations/authAPI';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleGetOtp = async () => {
    if (!email) {
      setMessage('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setMessage('');
    var check=await forgotPassword({email})();
    if(check){
      setOtpSent(true);
      setLoading(false);
      setMessage(`OTP sent to ${email}`);
    }
    else{
      setLoading(false);
      setMessage(`Email not registered`);
    }

  };

  const handleResetPassword = async () => {
    if (otp.length !== 6) {
      setMessage('Please enter a valid 6-digit OTP');
      return;
    }

    if (newPassword.length < 6) {
      setMessage('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setMessage('');
    const resetSuccess = await resetPassword({email,otp,newPassword,navigate})();
    setLoading(false);
    if (!resetSuccess) {
      setMessage('Invalid input. Password reset failed. Please try again.');
    }
  };

  return (
    <div className="w-screen min-h-[calc(100vh-80px)] bg-linear-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <div className="bg-white rounded-lg border-2 px-16 py-12 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black mb-2">Forgot Password</h1>
            <p className="text-gray-600 text-sm">
              {!otpSent ? 'Enter your email to receive OTP' : 'Enter OTP and new password'}
            </p>
          </div>

          {/* Email Input */}
          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-semibold text-black mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black bg-white text-black"
                placeholder="your@email.com"
                disabled={otpSent}
              />
            </div>
          </div>

          {/* OTP Input (shown after Get OTP is clicked) */}
          {otpSent && (
            <>
              <div className="mb-6">
                <label htmlFor="otp" className="block text-sm font-semibold text-black mb-2">
                  OTP
                </label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black bg-white text-black text-center text-xl tracking-widest font-mono"
                  placeholder="000000"
                  maxLength={6}
                />
              </div>

              {/* New Password Input */}
              <div className="mb-6">
                <label htmlFor="newPassword" className="block text-sm font-semibold text-black mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black bg-white text-black"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-black"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Message */}
          {message && (
            <div className="mb-6 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-700">{message}</p>
            </div>
          )}

          {/* Buttons */}
          {!otpSent ? (
            <button
              onClick={handleGetOtp}
              disabled={loading}
              className="w-full py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending OTP...' : 'Get OTP'}
            </button>
          ) : (
            <button
              onClick={handleResetPassword}
              disabled={loading || otp.length !== 6}
              className="w-full py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;