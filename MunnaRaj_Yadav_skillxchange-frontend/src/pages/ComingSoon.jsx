import React from 'react';
import { Link } from 'react-router-dom';

const ComingSoon = ({ title }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 bg-white relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-50"></div>
      
      <div className="relative z-10">
        <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl border border-gray-100 flex items-center justify-center mx-auto mb-8 animate-bounce">
          <span className="text-5xl">🚀</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight leading-none">
          {title || "Coming Soon"}
        </h1>
        <p className="text-lg text-gray-500 mb-10 max-w-md mx-auto font-medium leading-relaxed">
          We are currently building something amazing for this section. Stay tuned for the big reveal!
        </p>
        <Link 
          to="/" 
          className="inline-block px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 hover:scale-105 transition-all"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
};

export default ComingSoon;
