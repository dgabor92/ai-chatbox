import { useEffect, useState } from 'react';

export function useAiOverlay() {
  const [response, setResponse] = useState('');
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
      setLoading(false);
      setVisible(true);
    });

    // Jack implements the Cmd+K globalShortcut → ipcMain → renderer IPC bridge
    window.electronAPI.onAskAI?.(() => {
      setVisible(true);
    });
  }, []);

  return { response, loading, visible, setVisible, ask };
}
