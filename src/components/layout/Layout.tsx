import React, { useState } from 'react';
import { SidebarRail } from './SidebarRail';
import { TopHeader } from './TopHeader';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  return (
    <div className="min-h-screen bg-[#f4f7fe] text-slate-800 flex relative overflow-x-hidden selection:bg-sky-500 selection:text-white">
      {/* Decorative ambient soft yellow/amber background accents matching screenshot */}
      <div className="absolute -left-20 top-40 w-96 h-96 bg-amber-200/35 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -right-24 bottom-10 w-96 h-96 bg-amber-200/40 rounded-full blur-3xl pointer-events-none" />

      {/* Left Icon Navigation Rail */}
      {isSidebarVisible && <SidebarRail />}

      {/* Main Body */}
      <div className="flex-1 flex flex-col min-w-0 z-10">
        <TopHeader onToggleSidebar={() => setIsSidebarVisible(!isSidebarVisible)} />
        <main className="flex-1 px-6 sm:px-8 pb-10 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
