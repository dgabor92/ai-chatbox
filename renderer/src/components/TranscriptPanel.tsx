import { useEffect, useRef } from 'react';
import type { TranscriptEntry } from '../hooks/useTranscript';

interface Props {
  label: string;
  entries: TranscriptEntry[];
  colorClass: string;
}

function isQuestion(text: string) {
  return text.trimEnd().endsWith('?');
}

export function TranscriptPanel({ label, entries, colorClass }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries]);

  return (
    <div className="flex flex-col h-full bg-zinc-900/80 rounded-xl border border-zinc-700 overflow-hidden">
      <div className={`px-4 py-2 text-sm font-semibold tracking-wide ${colorClass} bg-zinc-800 border-b border-zinc-700`}>
        {label}
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 scrollbar-thin scrollbar-thumb-zinc-600">
        {entries.length === 0 ? (
          <p className="text-zinc-500 text-sm italic">Várakozás a hangra...</p>
        ) : (
          entries.map((entry) => (
            <p
              key={entry.id}
              className={`text-sm leading-relaxed rounded px-2 py-1 transition-colors ${
                isQuestion(entry.text)
                  ? 'bg-amber-500/15 text-amber-200 font-medium border-l-2 border-amber-400'
                  : 'text-zinc-200'
              }`}
            >
              {entry.text}
            </p>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
