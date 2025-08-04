import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

interface IconProps {
  src: string;
  alt: string;
}

const Icon: React.FC<IconProps> = ({ src, alt }) => (
  <img src={src} alt={alt} className="h-6 w-6 text-gray-400" />
);

const LoginForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const success = await login(email, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('نام کاربری یا رمز عبور اشتباه است.');
      }
    } catch (err) {
      setError('خطا در ارتباط با سرور. لطفا دوباره تلاش کنید.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <div className="flex w-full lg:w-1/2 items-center justify-center min-h-screen p-6">
      <motion.div
        className="relative w-full max-w-lg p-10 space-y-8 bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        dir="rtl"
      >
        <motion.div variants={itemVariants} className="text-center">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            ورود به پنل
          </h1>
          
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div variants={itemVariants} className="relative">
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <Icon src="/assets/User.svg" alt="User icon" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ایمیل"
              className="w-full h-14 pr-12 pl-4 text-gray-900 bg-white/40 border-2 border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-right placeholder-gray-400 hover:bg-white/60"
              required
            />
          </motion.div>

          <motion.div variants={itemVariants} className="relative">
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <Icon src="/assets/Lock.svg" alt="Lock icon" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="رمز عبور"
              className="w-full h-14 pr-12 pl-12 text-gray-900 bg-white/40 border-2 border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-right placeholder-gray-400 hover:bg-white/60"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 left-0 px-4 flex items-center text-gray-400 hover:text-blue-600 transition-colors"
            >
              {showPassword ? (
                <Icon src="/assets/Eye-slash.svg" alt="Hide password" />
              ) : (
                <Icon src="/assets/Eye.svg" alt="Show password" />
              )}
            </button>
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-3 text-red-600 text-sm bg-red-50/90 p-4 rounded-lg border border-red-200/50"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div variants={itemVariants}>
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
              whileHover={{ scale: 1.05, boxShadow: '0 10px 25px rgba(37, 99, 235, 0.4)' }}
              whileTap={{ scale: 0.95 }}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-white mx-auto"></div>
              ) : (
                'ورود'
              )}
            </motion.button>
          </motion.div>
        </form>

        <motion.div variants={itemVariants} className="text-center">
          <a href="#" className="text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">
            مشکلی در ورود دارید؟
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginForm;