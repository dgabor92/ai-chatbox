import { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

const HOTKEYS = [
  { keys: ['Cmd', 'K'], label: 'AI segítség kérés' },
  { keys: ['Cmd', 'Shift', 'S'], label: 'Képernyő capture AI-nak' },
  { keys: ['R'], label: 'Hangfelvétel indítása / leállítása' },
];

function Kbd({ children }: { children: string }) {
  return (
    <kbd className="inline-flex items-center px-1.5 py-0.5 rounded bg-gray-700 border border-gray-500 text-white text-xs font-mono">
      {children}
    </kbd>
  );
}

export function HotkeyHelp() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-gray-700"
        aria-label="Gyorsbillentyűk"
      >
        <HelpCircle size={16} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-gray-800 rounded-xl border border-gray-600 shadow-2xl w-80 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
              <span className="text-white font-semibold text-sm">Gyorsbillentyűk</span>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            <div className="px-4 py-3 space-y-3">
              {HOTKEYS.map(({ keys, label }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-gray-200 text-sm">{label}</span>
                  <div className="flex items-center gap-1">
                    {keys.map((k, i) => (
                      <span key={k} className="flex items-center gap-1">
                        <Kbd>{k}</Kbd>
                        {i < keys.length - 1 && (
                          <span className="text-gray-500 text-xs">+</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
