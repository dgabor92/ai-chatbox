// main/main.ts
import { app, BrowserWindow } from "electron";
import path from "path";

let win: BrowserWindow;

app.whenReady().then(() => {
  win = new BrowserWindow({
    width: 1200,
    height: 600,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, "../preload/preload.js"),
      contextIsolation: true,
    },
  });

  win.loadURL("http://localhost:5173"); // Vite dev server
});
