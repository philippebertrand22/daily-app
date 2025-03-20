import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  type = 'button', 
  color = 'primary', 
  fullWidth = false,
  disabled = false
}) => {
  // Generate button classes based on props
  let className = 'px-4 py-2 rounded-lg font-medium focus:outline-none ';

  // Add color classes
  if (color === 'primary') {
    className += 'bg-blue-500 hover:bg-blue-600 text-white ';
  } else if (color === 'secondary') {
    className += 'bg-purple-500 hover:bg-purple-600 text-white ';
  } else if (color === 'success') {
    className += 'bg-green-500 hover:bg-green-600 text-white ';
  } else if (color === 'danger') {
    className += 'bg-red-500 hover:bg-red-600 text-white ';
  } else {
    className += 'bg-gray-200 hover:bg-gray-300 text-gray-800 ';
  }

  // Add width class if fullWidth is true
  if (fullWidth) {
    className += 'w-full ';
  }

  // Add disabled class if disabled is true
  if (disabled) {
    className += 'opacity-50 cursor-not-allowed ';
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </button>
  );
};

export default Button;