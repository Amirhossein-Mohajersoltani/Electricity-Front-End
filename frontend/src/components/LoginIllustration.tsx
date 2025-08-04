import React from 'react';
import { motion } from 'framer-motion';

const LoginIllustration: React.FC = () => (
  <div className="hidden lg:flex w-full lg:w-1/2 items-center justify-center p-12 relative overflow-hidden">
    <motion.div
      className="w-full max-w-xl"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, type: 'spring', stiffness: 80 }}
    >
      <img
        src="/assets/undraw-illustration.svg"
        alt="Business analytics illustration"
        className="w-full h-auto drop-shadow-2xl transform hover:scale-105 transition-transform duration-500"
      />
      <div className="mt-10 text-center">
        <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
          پلتفرم هوشمند تحلیل داده
        </h2>
        <p className="mt-4 text-xl text-gray-500">
          بینش‌های جدید کسب کنید و تصمیمات بهتری بگیرید.
        </p>
      </div>
    </motion.div>
  </div>
);

export default LoginIllustration;