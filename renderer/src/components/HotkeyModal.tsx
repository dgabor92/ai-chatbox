import { X, HelpCircle } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

const hotkeys = [
  { keys: ['Cmd', 'K'], label: 'AI segítség kérés' },
  { keys: ['Cmd', 'Shift', 'S'], label: 'Képkivágás küldése AI-nak' },
];

function Kbd({ children }: { children: string }) {
  return (
    <kbd className="inline-flex items-center px-2 py-0.5 rounded bg-zinc-700 border border-zinc-500 text-zinc-200 text-xs font-mono">
      {children}
    </kbd>
  );
}

export function HotkeyModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-end p-4 pointer-events-none">
      <div className="pointer-events-auto w-72 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-zinc-800 border-b border-zinc-700">
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
            <HelpCircle size={14} />
            Gyorsbillentyűk
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200 transition-colors">
            <X size={14} />
          </button>
        </div>

        <div className="px-4 py-3 space-y-3">
          {hotkeys.map(({ keys, label }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-sm text-zinc-300">{label}</span>
              <div className="flex items-center gap-1">
                {keys.map((k, i) => (
                  <span key={k} className="flex items-center gap-1">
                    <Kbd>{k}</Kbd>
                    {i < keys.length - 1 && <span className="text-zinc-500 text-xs">+</span>}
                  </span>
                ))}
              </div>
            </div>
          ))}

          <div className="pt-2 border-t border-zinc-700">
            <p className="text-xs text-zinc-500 mb-1">Átlátszóság</p>
            <input
              type="range"
              min="0.2"
              max="1"
              step="0.05"
              defaultValue="1"
              className="w-full accent-indigo-500"
              onChange={(e) => window.electronAPI?.setOpacity(parseFloat(e.target.value))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
