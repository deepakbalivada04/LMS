import React, { useState } from 'react';
import { WiringDiagram } from '../../types/course';
import { Layers, AlertTriangle, ZoomIn, X, Info } from 'lucide-react';

interface WiringDiagramsTabProps {
  diagrams: WiringDiagram[];
}

export const WiringDiagramsTab: React.FC<WiringDiagramsTabProps> = ({ diagrams }) => {
  const [selectedDiagram, setSelectedDiagram] = useState<WiringDiagram | null>(null);

  if (!diagrams || diagrams.length === 0) {
    return (
      <div className="py-12 px-4 text-center text-slate-500 text-xs">
        <Layers className="w-8 h-8 mx-auto mb-2 text-slate-600" />
        <p>No wiring schematics attached to this lesson.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {diagrams.map((diag) => (
        <div
          key={diag.id}
          className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg"
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              {diag.title}
            </h4>
            <button
              type="button"
              onClick={() => setSelectedDiagram(diag)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition"
            >
              <ZoomIn className="w-3.5 h-3.5 text-indigo-400" />
              Full Screen
            </button>
          </div>

          {/* Schematic Image Canvas */}
          <div
            onClick={() => setSelectedDiagram(diag)}
            className="relative h-64 bg-slate-950 cursor-zoom-in group overflow-hidden"
          >
            <img
              src={diag.imageUrl}
              alt={diag.title}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
            />
            <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-slate-900/90 text-xs text-slate-300 border border-slate-700 flex items-center gap-1.5 backdrop-blur-md">
              <ZoomIn className="w-3.5 h-3.5 text-indigo-400" /> Click to enlarge
            </div>
          </div>

          {/* Content & Warnings */}
          <div className="p-5 space-y-3">
            <p className="text-xs text-slate-300 leading-relaxed">
              {diag.description}
            </p>

            {diag.voltageWarning && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="leading-snug">
                  <span className="font-semibold block text-amber-300 uppercase text-[11px] mb-0.5">
                    Hardware Safety Precaution
                  </span>
                  <span>{diag.voltageWarning}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Modal Zoom Preview */}
      {selectedDiagram && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-sm">
                  {selectedDiagram.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDiagram(null)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/40">
              <img
                src={selectedDiagram.imageUrl}
                alt={selectedDiagram.title}
                className="max-w-full max-h-[65vh] object-contain rounded-lg border border-slate-800"
              />
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950 text-xs text-slate-300 flex items-start gap-2">
              <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>{selectedDiagram.description}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
