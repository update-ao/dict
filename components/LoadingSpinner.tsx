
import React from 'react';

interface LoadingSpinnerProps {
  message: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => {
  return (
    <div className="text-center text-blue-500 font-medium mb-4">
      <p>{message}</p>
    </div>
  );
};

export default LoadingSpinner;
