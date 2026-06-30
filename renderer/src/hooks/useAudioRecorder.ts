import { useCallback, useRef, useState } from 'react';

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = async (e) => {
        if (!e.data.size) return;
        const buffer = await e.data.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
        window.electronAPI?.sendAudioChunk(base64);
      };

      recorder.onstart = () => setIsRecording(true);
      recorder.onstop = () => {
        setIsRecording(false);
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start(250); // 250ms chunks
      window.electronAPI?.audioStart();
    } catch (err) {
      console.error('Microphone access error:', err);
    }
  }, []);

  const stop = useCallback(() => {
    mediaRecorderRef.current?.stop();
    window.electronAPI?.audioStop();
  }, []);

  return { isRecording, start, stop };
}
