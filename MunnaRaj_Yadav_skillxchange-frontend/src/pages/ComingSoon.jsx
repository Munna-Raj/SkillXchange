import React from 'react';
import { Link } from 'react-router-dom';

const ComingSoon = ({ title }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="bg-blue-50 p-8 rounded-full mb-6">
        <span className="text-6xl">🚧</span>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{title || "Coming Soon"}</h1>
      <p className="text-gray-600 mb-8 max-w-md">
        We are working hard to bring you this page. Stay tuned for updates!
      </p>
      <Link to="/" className="btn-primary">
        Return Home
      </Link>
    </div>
  );
};

export default ComingSoon;
