import React from 'react';

const LoginIllustration: React.FC = () => {
  return (
    <div className="hidden lg:flex w-full lg:w-1/2 bg-[#EEF1F8] items-center justify-center p-8 lg:p-12 relative overflow-hidden">
      {/* Main Container */}
      <div className="relative z-10 w-full max-w-3xl flex items-center justify-center">
        
        {/* Undraw Illustration */}
        <div className="w-full max-w-2xl">
          <img 
            src="/assets/undraw-illustration.svg" 
            alt="Business analytics and data visualization illustration" 
            className="w-full h-auto object-contain"
          />
        </div>

      </div>
    </div>
  );
};

export default LoginIllustration; 