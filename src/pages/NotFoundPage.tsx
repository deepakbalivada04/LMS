import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
        <Bot className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-mono font-bold text-white mb-2">404</h1>
      <p className="text-sm text-slate-400 mb-6 font-mono">
        Subsystem coordinate not found.
      </p>
      <Link
        to="/dashboard"
        className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs rounded-lg transition inline-flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Mission Control
      </Link>
    </div>
  );
};

