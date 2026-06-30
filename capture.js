const overlay = document.getElementById("overlay");
let startX,
  startY,
  isSelecting = false;

document.addEventListener("mousedown", (e) => {
  startX = e.clientX;
  startY = e.clientY;
  overlay.style.left = `${startX}px`;
  overlay.style.top = `${startY}px`;
  overlay.style.width = "0px";
  overlay.style.height = "0px";
  overlay.style.display = "block";
  isSelecting = true;
});

document.addEventListener("mousemove", (e) => {
  if (!isSelecting) return;
  const width = e.clientX - startX;
  const height = e.clientY - startY;
  overlay.style.width = `${Math.abs(width)}px`;
  overlay.style.height = `${Math.abs(height)}px`;
  overlay.style.left = `${width < 0 ? e.clientX : startX}px`;
  overlay.style.top = `${height < 0 ? e.clientY : startY}px`;
});

document.addEventListener("mouseup", (e) => {
  isSelecting = false;
  const x = parseInt(overlay.style.left);
  const y = parseInt(overlay.style.top);
  const width = parseInt(overlay.style.width);
  const height = parseInt(overlay.style.height);

  // küldd vissza a main process-nek
  const { ipcRenderer } = require("electron");
  ipcRenderer.send("capture-area", { x, y, width, height });

  window.close();
});
