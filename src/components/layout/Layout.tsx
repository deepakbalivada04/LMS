import React from 'react';
import { TopHeader } from './TopHeader';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#f4f7fe] text-slate-800 flex flex-col relative overflow-x-hidden selection:bg-sky-500 selection:text-white">
      {/* Subtle ambient light accents */}
      <div className="absolute -left-20 top-20 w-96 h-96 bg-amber-200/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -right-24 bottom-10 w-96 h-96 bg-sky-200/25 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header with Intellipaat-style Tab Navigation */}
      <TopHeader />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10">
        {children}
      </main>
    </div>
  );
};
