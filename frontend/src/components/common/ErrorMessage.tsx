// /frontend/src/components/common/ErrorMessage.tsx
import React from 'react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div
      className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded relative mb-4"
      role="alert"
    >
      <div className="flex items-center">
        <span className="block sm:inline">{message}</span>
      </div>
      {onRetry && (
        <div className="mt-2">
          <button
            onClick={onRetry}
            className="bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100 px-3 py-1 rounded-md hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      )}
    </div>
  );
};

export default ErrorMessage;
