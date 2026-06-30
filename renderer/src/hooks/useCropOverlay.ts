import { useEffect, useRef, useState } from 'react';
import type { CropBounds } from '../types/electron';

interface DragState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  active: boolean;
}

const EMPTY_DRAG: DragState = { startX: 0, startY: 0, currentX: 0, currentY: 0, active: false };

export function useCropOverlay() {
  const [open, setOpen] = useState(false);
  const [drag, setDrag] = useState<DragState>(EMPTY_DRAG);
  const [confirmed, setConfirmed] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Jack implements Cmd+Shift+S globalShortcut → IPC → renderer
    window.electronAPI?.onStartCrop?.(() => setOpen(true));
  }, []);

  const bounds = (): CropBounds => {
    const x = Math.min(drag.startX, drag.currentX);
    const y = Math.min(drag.startY, drag.currentY);
    const w = Math.abs(drag.currentX - drag.startX);
    const h = Math.abs(drag.currentY - drag.startY);
    return { x, y, w, h };
  };

  const boxStyle = () => {
    const { x, y, w, h } = bounds();
    return { left: x, top: y, width: w, height: h };
  };

  const onMouseDown = (e: React.MouseEvent) => {
    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return;
    setDrag({ startX: e.clientX - rect.left, startY: e.clientY - rect.top, currentX: e.clientX - rect.left, currentY: e.clientY - rect.top, active: true });
    setConfirmed(false);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!drag.active) return;
    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return;
    setDrag((prev) => ({ ...prev, currentX: e.clientX - rect.left, currentY: e.clientY - rect.top }));
  };

  const onMouseUp = () => {
    if (!drag.active) return;
    setDrag((prev) => ({ ...prev, active: false }));
    setConfirmed(true);
  };

  const confirm = async () => {
    const screenshot = await window.electronAPI?.startCapture();
    if (screenshot) {
      window.electronAPI?.sendCropResult?.(screenshot, bounds());
    }
    close();
  };

  const close = () => {
    setOpen(false);
    setDrag(EMPTY_DRAG);
    setConfirmed(false);
  };

  const hasBounds = bounds().w > 10 && bounds().h > 10;

  return { open, setOpen, overlayRef, drag, boxStyle, onMouseDown, onMouseMove, onMouseUp, confirm, close, hasBounds, confirmed };
}
