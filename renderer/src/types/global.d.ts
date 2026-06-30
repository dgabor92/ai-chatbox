export {};

declare global {
  interface Window {
    electronAPI?: {
      sendMessage: (message: string) => void;
      onReply: (callback: (data: string) => void) => void;
      setOpacity: (value: number) => void;
      startCapture: () => void;
    };
  }
}
