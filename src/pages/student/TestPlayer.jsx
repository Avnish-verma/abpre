import React from 'react';
import { useNavigate } from 'react-router-dom';

const TestPlayer = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Test Platform</h1>
      <p className="text-gray-500 mb-6">Online tests are coming in the next update!</p>
      <button onClick={() => navigate(-1)} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">
        Go Back
      </button>
    </div>
  );
};

export default TestPlayer;