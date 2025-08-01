import React from 'react';
import LoginIllustration from '../components/LoginIllustration';
import LoginForm from '../components/LoginForm';

const Login: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row-reverse bg-white">
      {/* Illustration Panel - on the left in RTL layout on desktop, top on mobile */}
      <LoginIllustration />
      {/* Form Panel - on the right in RTL layout on desktop, bottom on mobile */}
      <LoginForm />
    </div>
  );
};

export default Login; 