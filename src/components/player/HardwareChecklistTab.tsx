import React, { useState } from 'react';
import { HardwareItem } from '../../types/course';
import { Cpu, CheckCircle2, Circle, AlertCircle, Wrench, Sparkles } from 'lucide-react';

interface HardwareChecklistTabProps {
  items: HardwareItem[];
}

export const HardwareChecklistTab: React.FC<HardwareChecklistTabProps> = ({ items }) => {
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  const toggleCheck = (id: string) => {
    const next = new Set(checkedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setCheckedIds(next);
  };

  const handleVerifyAll = () => {
    if (checkedIds.size === items.length) {
      setCheckedIds(new Set());
    } else {
      setCheckedIds(new Set(items.map((i) => i.id)));
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="py-12 px-4 text-center text-slate-500 text-xs">
        <Wrench className="w-8 h-8 mx-auto mb-2 text-slate-600" />
        <p>No additional hardware components required for this lesson.</p>
      </div>
    );
  }

  const allChecked = checkedIds.size === items.length && items.length > 0;

  return (
    <div className="space-y-4">
      {/* Workbench Status Header */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Physical Hardware Verification
          </div>
          <div className="text-sm font-bold text-white mt-0.5">
            {checkedIds.size} of {items.length} components inspected & ready on workbench
          </div>
        </div>

        <button
          type="button"
          onClick={handleVerifyAll}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            allChecked
              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
          }`}
        >
          {allChecked ? 'Reset All' : 'Verify All'}
        </button>
      </div>

      {allChecked && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-2">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>All hardware items verified! You are ready to start wiring the circuit.</span>
        </div>
      )}

      {/* Component Cards List */}
      <div className="space-y-3">
        {items.map((item) => {
          const isChecked = checkedIds.has(item.id);

          return (
            <div
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              className={`p-4 rounded-xl border transition cursor-pointer select-none ${
                isChecked
                  ? 'bg-slate-900/60 border-slate-800 opacity-80'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <button
                  type="button"
                  aria-label={`Toggle ${item.name}`}
                  className="mt-0.5 text-indigo-400 shrink-0"
                >
                  {isChecked ? (
                    <CheckCircle2 className="w-5 h-5 fill-emerald-500 text-slate-950" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-600 hover:text-slate-400" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className={`text-sm font-bold ${isChecked ? 'line-through text-slate-400' : 'text-white'}`}>
                      {item.name}
                    </span>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-indigo-300 shrink-0">
                      Qty: {item.quantity}
                    </span>
                  </div>

                  {item.partNumber && (
                    <div className="text-xs text-indigo-400 mb-1.5 flex items-center gap-1 font-mono">
                      <Cpu className="w-3.5 h-3.5" />
                      <span>Part: {item.partNumber}</span>
                    </div>
                  )}

                  <p className="text-xs text-slate-300 leading-relaxed mb-2">
                    {item.description}
                  </p>

                  {item.pinoutNotes && (
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span className="font-mono text-[11px]">{item.pinoutNotes}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
