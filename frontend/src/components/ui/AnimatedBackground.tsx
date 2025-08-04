import React from 'react';
import { motion } from 'framer-motion';

const AnimatedBackground: React.FC = () => {
  const particles = Array.from({ length: 20 }).map((_, i) => (
    <motion.div
      key={i}
      className="particle bg-blue-300/30 rounded-full"
      style={{
        width: Math.random() * 10 + 5 + 'px',
        height: Math.random() * 10 + 5 + 'px',
        top: Math.random() * 100 + '%',
        left: Math.random() * 100 + '%',
      }}
      animate={{
        y: [0, -50, 0],
        opacity: [0.2, 0.5, 0.2],
        transition: { duration: Math.random() * 4 + 4, repeat: Infinity },
      }}
    />
  ));

  return (
    <div className="absolute inset-0 -z-10 h-full w-full bg-gradient-to-b from-blue-50 to-white">
      {particles}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:6rem_6rem] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_60%,transparent_100%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.2),rgba(255,255,255,0))]"></div>
    </div>
  );
};

export default AnimatedBackground;