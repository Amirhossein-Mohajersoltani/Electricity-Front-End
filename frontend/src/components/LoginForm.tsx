import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    if (!email || !email.includes('@')) {
      return false;
    }
    
    if (!password || password.length < 3) {
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form before proceeding
    if (!validateForm()) {
      setError('لطفا اطلاعات صحیح وارد کنید');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const success = await login(email, password);
      
      if (success) {
        navigate('/dashboard');
      } else {
        setError('نام کاربری یا رمز عبور اشتباه است');
      }
    } catch (error) {
      setError('خطا در اتصال به سرور');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full lg:w-1/2 items-center justify-center min-h-screen bg-white" dir="rtl">
      <div className="w-full max-w-md px-6 py-8 mx-4 lg:mx-0">
        {/* Title */}
        <div className="text-right mb-8" dir="rtl">
          <h1 className="text-black font-bold text-[32px] leading-tight mb-4 text-right">
            وارد شوید!
          </h1>
          <p className="text-gray-600 text-[16px] leading-relaxed text-right">
            لطفا ایمیل و رمز عبور خودتان را وارد کنید
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
          {/* Email Input */}
          <div className="relative">
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <img 
                  src="/assets/User.svg" 
                  alt="User icon" 
                  className="h-5 w-5 text-gray-400"
                />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ایمیل، نام کاربری"
                className="w-full h-14 pr-14 pl-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-right placeholder-gray-400 text-[16px]"
                dir="rtl"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="relative">
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <img 
                  src="/assets/Lock.svg" 
                  alt="Lock icon" 
                  className="h-5 w-5 text-gray-400"
                />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="رمز عبور"
                className="w-full h-14 pr-14 pl-14 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-right placeholder-gray-400 text-[16px]"
                dir="rtl"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 left-0 pl-4 flex items-center hover:bg-gray-50 rounded-l-xl transition-colors duration-200"
              >
                <img 
                  src="/assets/Eye.svg" 
                  alt="Toggle password visibility" 
                  className="h-5 w-5 text-gray-400 hover:text-gray-600"
                />
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          {/* Login Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-[#2563EB] text-white font-medium text-[18px] rounded-xl hover:bg-[#1d4ed8] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl text-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'در حال ورود...' : 'ورود'}
            </button>
          </div>

          {/* Forgot Password Link */}
          <div className="text-right pt-6" dir="rtl">
            <a 
              href="#" 
              className="text-[#2563EB] hover:text-[#1d4ed8] text-[14px] font-medium transition-colors duration-200 text-right"
            >
              فراموشی رمز عبور
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm; 