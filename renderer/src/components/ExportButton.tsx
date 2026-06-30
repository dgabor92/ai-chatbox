import { Download } from 'lucide-react';
import type { TranscriptEntry } from '../hooks/useTranscript';

interface Props {
  interviewer: TranscriptEntry[];
  candidate: TranscriptEntry[];
  aiResponses: string[];
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function ExportButton({ interviewer, candidate, aiResponses }: Props) {
  const handleExport = () => {
    const iso = new Date().toISOString();

    const lines = [
      '# Interjú átirat',
      '',
      `## Dátum: ${iso}`,
      '',
      '### Interjúztató',
      '',
      ...interviewer.map((e) => `[${formatTime(e.timestamp)}] ${e.text}`),
      '',
      '### Jelölt',
      '',
      ...candidate.map((e) => `[${formatTime(e.timestamp)}] ${e.text}`),
      '',
      '### AI válaszok',
      '',
      ...aiResponses.map((r, i) => `${i + 1}. ${r}`),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-gray-700"
    >
      <Download size={13} />
      Export MD
    </button>
  );
}
