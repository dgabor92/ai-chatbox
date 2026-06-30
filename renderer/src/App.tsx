import { useState } from 'react';
import { HelpCircle, Download } from 'lucide-react';
import { useTranscript } from './hooks/useTranscript';
import { useAiOverlay } from './hooks/useAiOverlay';
import { useCropOverlay } from './hooks/useCropOverlay';
import { TranscriptPanel } from './components/TranscriptPanel';
import { AiOverlay } from './components/AiOverlay';
import { CropOverlay } from './components/CropOverlay';
import { HotkeyModal } from './components/HotkeyModal';

function exportMarkdown(interviewer: { text: string }[], candidate: { text: string }[]) {
  const date = new Date().toISOString().slice(0, 10);
  const lines = [
    `# Interview Transcript — ${date}`,
    '',
    '## Interviewer',
    '',
    ...interviewer.map((e) => `- ${e.text}`),
    '',
    '## Candidate',
    '',
    ...candidate.map((e) => `- ${e.text}`),
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `interview-${date}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

function App() {
  const [hotkeyOpen, setHotkeyOpen] = useState(false);

  const interviewerEntries = useTranscript('Speaker 1');
  const candidateEntries = useTranscript('Speaker 2');
  const ai = useAiOverlay();
  const crop = useCropOverlay();

  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 drag shrink-0">
        <h1 className="text-sm font-semibold text-zinc-100 tracking-wide">
          Interview Assistant
        </h1>
        <div className="flex items-center gap-3 no-drag">
          <button
            onClick={() => exportMarkdown(interviewerEntries, candidateEntries)}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-100 transition-colors px-2 py-1 rounded hover:bg-zinc-800"
          >
            <Download size={13} />
            Export MD
          </button>
          <button
            onClick={() => setHotkeyOpen((o) => !o)}
            className="text-zinc-400 hover:text-zinc-100 transition-colors p-1 rounded hover:bg-zinc-800"
            aria-label="Gyorsbillentyűk"
          >
            <HelpCircle size={16} />
          </button>
        </div>
      </header>

      {/* Main: 3 columns */}
      <main className="flex flex-1 gap-3 p-3 overflow-hidden">
        {/* Interviewer transcript */}
        <div className="flex-1 min-w-0">
          <TranscriptPanel
            label="Interviewer (Speaker 1)"
            entries={interviewerEntries}
            colorClass="text-sky-300"
          />
        </div>

        {/* Candidate transcript */}
        <div className="flex-1 min-w-0">
          <TranscriptPanel
            label="Candidate (Speaker 2)"
            entries={candidateEntries}
            colorClass="text-emerald-300"
          />
        </div>

        {/* AI overlay panel */}
        <div className="w-72 shrink-0">
          {ai.visible ? (
            <AiOverlay
              response={ai.response}
              loading={ai.loading}
              visible={ai.visible}
              onClose={() => ai.setVisible(false)}
              onAsk={ai.ask}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-700 text-zinc-600 text-sm gap-2">
              <span>AI panel</span>
              <span className="text-xs">Cmd+K</span>
            </div>
          )}
        </div>
      </main>

      {/* Overlays */}
      <CropOverlay {...crop} />
      <HotkeyModal open={hotkeyOpen} onClose={() => setHotkeyOpen(false)} />
    </div>
  );
}

export default App;
