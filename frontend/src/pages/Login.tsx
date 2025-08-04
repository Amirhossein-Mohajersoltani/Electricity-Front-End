import React from 'react';
import LoginForm from '../components/LoginForm';
import LoginIllustration from '../components/LoginIllustration';
import AnimatedBackground from '../components/ui/AnimatedBackground';

const LoginPage: React.FC = () => (
  <main className="relative flex flex-row-reverse w-full min-h-screen overflow-hidden">
    <AnimatedBackground />
    <LoginForm />
    <LoginIllustration />
  </main>
);

export default LoginPage;