import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  message = 'Chargement...',
}) => {
  let spinnerSize: string;
  switch (size) {
    case 'small':
      spinnerSize = 'w-6 h-6';
      break;
    case 'large':
      spinnerSize = 'w-16 h-16';
      break;
    case 'medium':
    default:
      spinnerSize = 'w-10 h-10';
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div
        className={`${spinnerSize} border-4 border-t-4 border-gray-200 border-t-blue-500 rounded-full animate-spin`}
      ></div>
      {message && <p className="mt-4 text-gray-600 dark:text-gray-300">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
