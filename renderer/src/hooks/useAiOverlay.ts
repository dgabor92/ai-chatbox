import { useEffect, useState } from 'react';

export function useAiOverlay() {
  const [response, setResponse] = useState('');
  const [responses, setResponses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  const ask = (prompt: string) => {
    if (!prompt.trim()) return;
    setLoading(true);
    setVisible(true);
    setResponse('');
    window.electronAPI?.sendMessage(prompt);
  };

  useEffect(() => {
    if (!window.electronAPI) return;

    window.electronAPI.onReply((data) => {
      setResponse(data);
      setResponses((prev) => [...prev, data]);
      setLoading(false);
      setVisible(true);
    });
  }, []);

  return { response, responses, loading, visible, setVisible, ask };
}
