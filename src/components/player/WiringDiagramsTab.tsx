import React, { useState } from 'react';
import { WiringDiagram } from '../../types/course';
import { Layers, AlertTriangle, Cpu, Zap, Activity, CheckCircle2 } from 'lucide-react';

interface WiringDiagramsTabProps {
  diagrams: WiringDiagram[];
}

export const WiringDiagramsTab: React.FC<WiringDiagramsTabProps> = ({ diagrams }) => {
  const [selectedPin, setSelectedPin] = useState<string | null>(null);

  if (!diagrams || diagrams.length === 0) {
    return (
      <div className="py-12 px-4 text-center text-slate-500 text-xs">
        <Layers className="w-8 h-8 mx-auto mb-2 text-slate-400" />
        <p>No wiring schematics attached to this project stage.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {diagrams.map((diag) => (
        <div
          key={diag.id}
          className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">
                  {diag.title}
                </h4>
                <span className="text-[11px] text-slate-400 font-medium">
                  Interactive Circuit Pinout & Signal Mapping
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Live Vector Schematic</span>
            </div>
          </div>

          {/* Interactive Live Schematic Canvas */}
          <div className="p-6 bg-slate-900 text-white relative select-none">
            {/* Visual Board Canvas */}
            <div className="border border-slate-800 rounded-2xl p-6 bg-[#0b0f19] relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-8 py-4">
                {/* Microcontroller Block */}
                <div className="w-full sm:w-44 p-4 rounded-2xl bg-slate-800/90 border border-sky-500/40 text-center shadow-lg">
                  <div className="flex items-center justify-center gap-1.5 text-sky-400 text-xs font-bold mb-1">
                    <Cpu className="w-4 h-4" />
                    <span>ESP32 MCU</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block font-mono">3.3V Logic Level</span>
                  <div className="mt-3 pt-2 border-t border-slate-700 space-y-1 text-[11px] font-mono text-left">
                    <div className="px-2 py-0.5 rounded bg-sky-950/60 text-sky-300">GPIO 16 (PWM A)</div>
                    <div className="px-2 py-0.5 rounded bg-sky-950/60 text-sky-300">GPIO 18 (PWM B)</div>
                    <div className="px-2 py-0.5 rounded bg-slate-700/60 text-slate-300">GND (Common)</div>
                  </div>
                </div>

                {/* Animated Signal Flow Indicator */}
                <div className="flex flex-col items-center justify-center gap-1 text-slate-500 text-xs font-mono">
                  <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wider">
                    PWM & Logic Signals
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                    <span className="h-0.5 w-16 bg-gradient-to-r from-sky-400 to-indigo-500" />
                    <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  </div>
                  <span className="text-[10px] text-slate-400">20 kHz High-Frequency</span>
                </div>

                {/* Hardware Driver / Actuator Block */}
                <div className="w-full sm:w-44 p-4 rounded-2xl bg-slate-800/90 border border-emerald-500/40 text-center shadow-lg">
                  <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-bold mb-1">
                    <Activity className="w-4 h-4" />
                    <span>L298N Driver</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block font-mono">Dual H-Bridge</span>
                  <div className="mt-3 pt-2 border-t border-slate-700 space-y-1 text-[11px] font-mono text-left">
                    <div className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300">IN1 / IN2 (Motor A)</div>
                    <div className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300">IN3 / IN4 (Motor B)</div>
                    <div className="px-2 py-0.5 rounded bg-rose-950/60 text-rose-300">7.4V LiPo (+)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pin Connections Matrix Table */}
          <div className="p-6 space-y-4">
            <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Exact Jumper Wire Routing Guide
            </h5>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-[10px] uppercase">
                    <th className="pb-2">Source Pin</th>
                    <th className="pb-2">Destination Component</th>
                    <th className="pb-2">Signal Type</th>
                    <th className="pb-2 text-right">Wire Color</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80">
                  {diag.pinConnections.map((pin, pIdx) => (
                    <tr
                      key={pIdx}
                      onClick={() => setSelectedPin(pin.from)}
                      className={`hover:bg-slate-50 transition cursor-pointer ${
                        selectedPin === pin.from ? 'bg-sky-50/60' : ''
                      }`}
                    >
                      <td className="py-2.5 font-bold text-slate-800">{pin.from}</td>
                      <td className="py-2.5 text-slate-600">{pin.to}</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {pin.signalType}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <span
                          className="inline-block w-3 h-3 rounded-full shadow-xs align-middle mr-1.5"
                          style={{ backgroundColor: pin.color }}
                        />
                        <span className="text-[11px] text-slate-500 capitalize">
                          {pin.signalType === 'Power' ? 'Red' : pin.signalType === 'Ground' ? 'Black' : 'Blue / Jumper'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Voltage Safety Warning Alert */}
            {diag.voltageWarning && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="leading-snug">
                  <span className="font-bold block text-amber-950 uppercase text-[10px] mb-0.5">
                    Hardware Safety Rule
                  </span>
                  <span>{diag.voltageWarning}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
