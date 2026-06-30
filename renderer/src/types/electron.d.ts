export interface ElectronAPI {
  sendMessage: (message: string) => void;
  onReply: (callback: (data: string) => void) => void;
  setOpacity: (value: number) => void;
  startCapture: () => Promise<string | null>;
  audioStart: () => void;
  audioStop: () => void;
  sendAudioChunk: (chunkBase64: string) => void;
  onAudioRecordingStarted: (callback: () => void) => void;
  onAudioRecordingStopped: (callback: () => void) => void;
  onShortcutSnip: (callback: () => void) => void;
  onShortcutAiTrigger: (callback: () => void) => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
