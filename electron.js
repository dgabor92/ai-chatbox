const {
  app,
  BrowserWindow,
  ipcMain,
  globalShortcut,
  desktopCapturer,
  nativeImage,
} = require('electron');
const path = require('path');
const axios = require('axios');
const screenshot = require('screenshot-desktop');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Invisible during screen sharing / recording
  win.setContentProtection(true);

  win.loadURL('http://localhost:5173');
  global.mainWindow = win;
}

// --- Text / LLM ---
ipcMain.on('message', async (event, prompt) => {
  try {
    const response = await axios.post('http://localhost:5001/ask', { prompt });
    event.reply('reply', response.data.result);
  } catch (error) {
    console.error('LLM request error:', error);
    event.reply('reply', '⚠️ Hiba történt az LLM kérés során.');
  }
});

// --- Opacity ---
ipcMain.on('set-opacity', (_event, value) => {
  global.mainWindow?.setOpacity(value);
});

// --- Screenshot capture ---
ipcMain.handle('capture-area', async (_event, bounds) => {
  try {
    const imgBuffer = await screenshot({ format: 'png' });
    return imgBuffer.toString('base64');
  } catch (err) {
    console.error('Screenshot error:', err);
    return null;
  }
});

// --- Audio: microphone streaming ---
ipcMain.on('audio-start', (_event) => {
  global.mainWindow?.webContents.send('audio-recording-started');
});

ipcMain.on('audio-stop', (_event) => {
  global.mainWindow?.webContents.send('audio-recording-stopped');
});

ipcMain.on('audio-chunk', async (_event, chunkBase64) => {
  try {
    await axios.post('http://localhost:5001/audio-chunk', {
      chunk: chunkBase64,
    });
  } catch (err) {
    console.error('Audio chunk forwarding error:', err);
  }
});

app.whenReady().then(() => {
  createWindow();

  // Cmd+Shift+S: snip / screenshot trigger
  globalShortcut.register('CommandOrControl+Shift+S', () => {
    global.mainWindow?.webContents.send('shortcut-snip');
  });

  // Cmd+K: AI prompt trigger
  globalShortcut.register('CommandOrControl+K', () => {
    global.mainWindow?.webContents.send('shortcut-ai-trigger');
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
