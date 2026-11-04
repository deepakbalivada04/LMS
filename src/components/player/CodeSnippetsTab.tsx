import React, { useState } from 'react';
import { CodeSnippet } from '../../types/course';
import { FileCode, Copy, Check, Download, Terminal } from 'lucide-react';

interface CodeSnippetsTabProps {
  snippets: CodeSnippet[];
}

export const CodeSnippetsTab: React.FC<CodeSnippetsTabProps> = ({ snippets }) => {
  const [activeSnippetIndex, setActiveSnippetIndex] = useState(0);
  const [isCopied, setIsCopied] = useState(false);

  if (!snippets || snippets.length === 0) {
    return (
      <div className="py-12 px-4 text-center text-slate-500 text-xs">
        <FileCode className="w-8 h-8 mx-auto mb-2 text-slate-600" />
        <p>No firmware or code snippets attached to this lesson.</p>
      </div>
    );
  }

  const currentSnippet = snippets[activeSnippetIndex] || snippets[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSnippet.code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentSnippet.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = currentSnippet.filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const lines = currentSnippet.code.trim().split('\n');

  return (
    <div className="space-y-4">
      {/* File selector pills */}
      {snippets.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {snippets.map((snip, index) => (
            <button
              key={snip.id}
              onClick={() => setActiveSnippetIndex(index)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 flex items-center gap-1.5 ${
                index === activeSnippetIndex
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              {snip.filename}
            </button>
          ))}
        </div>
      )}

      {/* Code Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {/* Header */}
        <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-mono font-semibold text-slate-200">
              {currentSnippet.filename}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase bg-slate-800 text-slate-400">
              {currentSnippet.language}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition"
              title="Copy snippet"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Code</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition"
              title={`Download ${currentSnippet.filename}`}
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Code Description */}
        {currentSnippet.description && (
          <div className="px-4 py-2 bg-slate-900 border-b border-slate-800/80 text-xs text-slate-400">
            {currentSnippet.description}
          </div>
        )}

        {/* Code Lines Block */}
        <div className="overflow-x-auto p-4 text-xs font-mono leading-relaxed bg-[#0b0f19] text-slate-200">
          <table className="w-full border-collapse">
            <tbody>
              {lines.map((line, idx) => (
                <tr key={idx} className="hover:bg-slate-800/20">
                  <td className="w-8 pr-4 text-right text-slate-600 select-none text-[11px]">
                    {idx + 1}
                  </td>
                  <td className="whitespace-pre pl-2">
                    <span
                      dangerouslySetInnerHTML={{
                        __html: line
                          .replace(/(#define|#include|const|int|void|float|class|def|import|from|return)/g, '<span class="text-indigo-400 font-semibold">$1</span>')
                          .replace(/(\/\/.+|\/\*.+\*\/|#.+)/g, '<span class="text-slate-500 italic">$1</span>')
                          .replace(/(".*?"|'.*?')/g, '<span class="text-emerald-300">$1</span>')
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
