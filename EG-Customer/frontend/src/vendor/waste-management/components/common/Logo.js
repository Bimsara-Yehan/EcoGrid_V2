import React, { useState } from 'react';

const Logo = ({ size = 36, className = '' }) => {
  const sources = [
    '/images/Eco.png',
    '/image/Eco.png',
    '/Eco.png',
    '/uploads/Eco.png'
  ];
  const [idx, setIdx] = useState(0);

  const handleError = () => {
    if (idx < sources.length - 1) setIdx(idx + 1);
  };

  return (
    <img
      src={sources[idx]}
      alt="EcoGrid"
      width={size}
      height={size}
      onError={handleError}
      className={className}
      style={{ width: size, height: size }}
    />
  );
};

export default Logo;
