import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { X, Sparkles, Send } from 'lucide-react';

interface Props {
  response: string;
  loading: boolean;
  visible: boolean;
  onClose: () => void;
  onAsk: (prompt: string) => void;
}

export function AiOverlay({ response, loading, visible, onClose, onAsk }: Props) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onAsk(input);
    setInput('');
  };

  if (!visible) return null;

  return (
    <div className="flex flex-col h-full bg-zinc-900/90 rounded-xl border border-indigo-500/40 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-800 border-b border-zinc-700">
        <div className="flex items-center gap-2 text-sm font-semibold text-indigo-300">
          <Sparkles size={14} />
          AI segítség
          <span className="text-zinc-500 font-normal text-xs">Cmd+K</span>
        </div>
        <button
          onClick={onClose}
          className="text-zinc-500 hover:text-zinc-200 transition-colors no-drag"
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        {loading ? (
          <div className="flex items-center gap-2 text-zinc-400 text-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse delay-150" />
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse delay-300" />
          </div>
        ) : response ? (
          <div className="prose prose-invert prose-sm max-w-none text-zinc-200">
            <ReactMarkdown>{response}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-zinc-500 text-sm italic">Tegyél fel kérdést...</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 px-3 py-2 border-t border-zinc-700 no-drag">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Kérdés..."
          className="flex-1 bg-zinc-800 text-zinc-100 text-sm rounded-lg px-3 py-1.5 outline-none border border-zinc-600 focus:border-indigo-500 transition-colors placeholder:text-zinc-500"
        />
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-3 py-1.5 transition-colors"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
