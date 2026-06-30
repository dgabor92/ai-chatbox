export interface ElectronAPI {
  sendMessage: (message: string) => void;
  onReply: (callback: (data: string) => void) => void;
  setOpacity: (value: number) => void;
  startCapture: () => Promise<string | null>;
  // Implemented by Jack (globalShortcut + IPC)
  onAskAI?: (callback: () => void) => void;
  onStartCrop?: (callback: () => void) => void;
  sendCropResult?: (base64: string, bounds: CropBounds) => void;
}

export interface CropBounds {
  x: number;
  y: number;
  w: number;
  h: number;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
