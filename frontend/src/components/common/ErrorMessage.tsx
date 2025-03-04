import React from 'react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div className="error-message" role="alert">
      <span>{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="retry-button"
          style={{
            marginLeft: 'auto',
            padding: '0.25rem 0.5rem',
            backgroundColor: '#fecaca',
            color: '#b91c1c',
            border: 'none',
            borderRadius: '0.25rem',
            cursor: 'pointer',
          }}
        >
          Réessayer
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
