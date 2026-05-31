const { app, BrowserWindow, globalShortcut, screen, ipcMain, shell, powerSaveBlocker } = require('electron');
const path = require('path');
const fs = require('fs');

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

let mainWindow = null;
let isLocked = false;
let isQuitting = false;
let devForceQuitCount = 0;
let focusTimerEnd = null;
let focusTimerInterval = null;
let powerSaveBlockerId = null;
let lockdownStartTime = null;

const isDev = process.env.NODE_ENV === 'development';

const logError = (error) => {
  try {
    const logPath = path.join(app.getPath('userData'), 'error.log');
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${error.stack || error}\n`;
    fs.appendFileSync(logPath, logMessage);
  } catch (err) {
    console.error('Failed to write error log:', err);
  }
};

process.on('uncaughtException', (error) => {
  logError(error);
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason) => {
  logError(reason);
  console.error('Unhandled Rejection:', reason);
});

// ============================================
// WINDOW CREATION
// ============================================
function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  
  mainWindow = new BrowserWindow({
    width: Math.floor(width * 0.95),
    height: Math.floor(height * 0.95),
    minWidth: 1024,
    minHeight: 768,
    show: false,
    frame: true,
    titleBarStyle: 'default',
    backgroundColor: '#0a0e17',
    fullscreenable: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, 'preload.cjs'),
      spellcheck: true,
      webSecurity: !isDev,
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173').catch(err => {
      console.error('Failed to load dev server:', err);
    });
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html')).catch(err => {
      console.error('Failed to load production build:', err);
    });
  }

  mainWindow.once('ready-to-show', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.show();
      mainWindow.setFullScreenable(true);
    }
  });

  // ============================================
  // KEYBOARD HOOKING - before-input-event
  // ============================================
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (!isLocked) return;

    // Developer safety valve: Ctrl+Shift+K to escape
    if (input.control && input.shift && input.key === 'K') {
      console.log('[Safety] Developer escape activated!');
      forceUnlock();
      event.preventDefault();
      return;
    }

    // Block Escape key
    if (input.key === 'Escape') {
      console.log('[Lockdown] Blocked: Escape');
      event.preventDefault();
      return;
    }

    // Block Alt+Tab, Cmd+Tab (app switching)
    if ((input.alt || input.meta) && input.key === 'Tab') {
      console.log('[Lockdown] Blocked: App Switch');
      event.preventDefault();
      return;
    }

    // Block Alt+F4
    if (input.alt && input.key === 'F4') {
      console.log('[Lockdown] Blocked: Alt+F4');
      event.preventDefault();
      return;
    }

    // Block Windows/Command key
    if (input.key === 'Meta' || input.key === 'Super') {
      console.log('[Lockdown] Blocked: Meta/Super key');
      event.preventDefault();
      return;
    }

    // Block Ctrl+R / Cmd+R (refresh)
    if ((input.control || input.meta) && input.key === 'r') {
      console.log('[Lockdown] Blocked: Refresh');
      event.preventDefault();
      return;
    }

    // Block Ctrl+Shift+R / Cmd+Shift+R (hard refresh)
    if ((input.control || input.meta) && input.shift && input.key === 'r') {
      console.log('[Lockdown] Blocked: Hard Refresh');
      event.preventDefault();
      return;
    }

    // Block Ctrl+W / Cmd+W (close tab)
    if ((input.control || input.meta) && input.key === 'w') {
      console.log('[Lockdown] Blocked: Close Tab');
      event.preventDefault();
      return;
    }

    // Block Ctrl+T / Cmd+T (new tab)
    if ((input.control || input.meta) && input.key === 't') {
      console.log('[Lockdown] Blocked: New Tab');
      event.preventDefault();
      return;
    }

    // Block Ctrl+N / Cmd+N (new window)
    if ((input.control || input.meta) && input.key === 'n') {
      console.log('[Lockdown] Blocked: New Window');
      event.preventDefault();
      return;
    }

    // Block Ctrl+D / Cmd+D (bookmark)
    if ((input.control || input.meta) && input.key === 'd') {
      console.log('[Lockdown] Blocked: Bookmark');
      event.preventDefault();
      return;
    }

    // Block F5 (refresh)
    if (input.key === 'F5') {
      console.log('[Lockdown] Blocked: F5 Refresh');
      event.preventDefault();
      return;
    }

    // Block F11 (fullscreen toggle)
    if (input.key === 'F11') {
      console.log('[Lockdown] Blocked: F11');
      event.preventDefault();
      return;
    }

    // Block PrintScreen
    if (input.key === 'PrintScreen') {
      console.log('[Lockdown] Blocked: PrintScreen');
      event.preventDefault();
      return;
    }
  });

  // ============================================
  // WHITELIST NAVIGATION
  // ============================================
  const allowedURLs = ['localhost:5173', 'file://', 'app://', 'devtools://'];

  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    if (isLocked) {
      const isAllowed = allowedURLs.some(url => navigationUrl.includes(url));
      if (!isAllowed) {
        event.preventDefault();
        console.log('[Security] Blocked navigation:', navigationUrl);
      }
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isLocked) {
      console.log('[Security] Blocked external link:', url);
      return { action: 'deny' };
    }
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // ============================================
  // WINDOW CLOSE PROTECTION
  // ============================================
  mainWindow.on('close', (e) => {
    if (isLocked && !isQuitting) {
      e.preventDefault();
      console.log('[Security] Close blocked during lockdown');
      mainWindow.webContents.send('lockdown-exit-blocked');
      return false;
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // ============================================
  // RELOAD INTO LOCKDOWN STATE
  // ============================================
  mainWindow.webContents.on('did-finish-load', () => {
    if (isLocked) {
      console.log('[Lockdown] Page reloaded - restoring lockdown state');
      mainWindow.webContents.send('lockdown-restore', {
        isLocked: true,
        focusTimerEnd,
        remainingMs: focusTimerEnd ? Math.max(0, focusTimerEnd - Date.now()) : 0,
        lockdownStartTime,
      });
    }
  });
}

// ============================================
// FORCE UNLOCK (Dev Safety Valve)
// ============================================
function forceUnlock() {
  console.log('[Safety] Force unlocking...');
  isLocked = false;
  devForceQuitCount = 0;

  if (focusTimerInterval) clearInterval(focusTimerInterval);
  focusTimerInterval = null;
  focusTimerEnd = null;
  lockdownStartTime = null;

  if (powerSaveBlocker.isStarted(powerSaveBlockerId)) {
    powerSaveBlocker.stop(powerSaveBlockerId);
    powerSaveBlockerId = null;
  }

  globalShortcut.unregisterAll();

  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.setKiosk(false);
    mainWindow.setAlwaysOnTop(false);
    mainWindow.setFullScreen(false);
    mainWindow.setSkipTaskbar(false);
    mainWindow.webContents.send('lockdown-force-ended');
  }
}

// ============================================
// START LOCKDOWN
// ============================================
ipcMain.handle('start-lockdown', async (event, options) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win || win.isDestroyed()) return false;
  
  console.log('[Lockdown] Starting hard lockdown...');
  isLocked = true;
  lockdownStartTime = Date.now();
  
  // Store focus end time
  if (options && options.durationMinutes) {
    focusTimerEnd = Date.now() + (options.durationMinutes * 60 * 1000);
    console.log('[Lockdown] Timer set. Auto-unlock at:', new Date(focusTimerEnd).toLocaleTimeString());
    
    if (focusTimerInterval) clearInterval(focusTimerInterval);
    focusTimerInterval = setInterval(() => {
      if (focusTimerEnd && Date.now() >= focusTimerEnd) {
        console.log('[Lockdown] Timer finished! Auto-unlocking...');
        clearInterval(focusTimerInterval);
        focusTimerInterval = null;
        focusTimerEnd = null;
        lockdownStartTime = null;
        
        isLocked = false;
        
        if (powerSaveBlocker.isStarted(powerSaveBlockerId)) {
          powerSaveBlocker.stop(powerSaveBlockerId);
          powerSaveBlockerId = null;
        }
        
        globalShortcut.unregisterAll();
        
        if (win && !win.isDestroyed()) {
          win.setKiosk(false);
          win.setAlwaysOnTop(false);
          win.setFullScreen(false);
          win.setSkipTaskbar(false);
          win.webContents.send('lockdown-auto-ended');
        }
      }
    }, 1000);
  }
  
  // 1. Kiosk Mode
  win.setKiosk(true);
  win.setAlwaysOnTop(true, 'screen-saver');
  win.setFullScreen(true);
  win.setSkipTaskbar(true);
  
  // 2. Power Save Blocker - prevent sleep/screensaver
  powerSaveBlockerId = powerSaveBlocker.start('prevent-display-sleep');
  console.log('[Lockdown] Power save blocker started:', powerSaveBlockerId);
  
  // 3. Block global shortcuts
  const shortcuts = [
    'Escape', 'Alt+F4', 'Alt+Tab', 'CommandOrControl+W', 'CommandOrControl+Q',
    'CommandOrControl+T', 'CommandOrControl+N', 'CommandOrControl+R', 'F5', 'F11',
    'Super+Tab', 'Super+D', 'Super+L', 'Super+M',
  ];
  
  shortcuts.forEach(shortcut => {
    try {
      globalShortcut.register(shortcut, () => {
        console.log('[Lockdown] Blocked global:', shortcut);
        return false;
      });
    } catch (err) {
      console.log('[Lockdown] Could not register:', shortcut);
    }
  });
  
  // Developer escape: Ctrl+Shift+Alt+Q pressed 5 times
  globalShortcut.register('CommandOrControl+Shift+Alt+Q', () => {
    devForceQuitCount++;
    console.log('[Safety] Dev escape:', devForceQuitCount, '/5');
    if (devForceQuitCount >= 5) {
      forceUnlock();
    }
    return false;
  });
  
  // 4. CSS injection
  win.webContents.insertCSS(`
    footer, .music-player, .notification-bell, .news-widget, .jobs-widget,
    .ai-tools-section, .daily-update-section, .trust-section,
    .final-cta-section, .benefits-section, .theme-toggle-container,
    [class*="NewsWidget"], [class*="JobsWidget"] { display: none !important; }
    .sidebar { opacity: 0.7 !important; transition: opacity 0.3s ease !important; }
    .sidebar:hover { opacity: 1 !important; }
    header, main { display: flex !important; visibility: visible !important; opacity: 1 !important; }
    header { z-index: 99999 !important; }
  `).catch(err => console.error('[Lockdown] CSS error:', err));
  
  return true;
});

// ============================================
// END LOCKDOWN
// ============================================
ipcMain.handle('end-lockdown', async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win || win.isDestroyed()) return false;
  
  console.log('[Lockdown] Ending lockdown...');
  isLocked = false;
  devForceQuitCount = 0;

  if (focusTimerInterval) clearInterval(focusTimerInterval);
  focusTimerInterval = null;
  focusTimerEnd = null;
  lockdownStartTime = null;

  if (powerSaveBlocker.isStarted(powerSaveBlockerId)) {
    powerSaveBlocker.stop(powerSaveBlockerId);
    powerSaveBlockerId = null;
  }

  win.setKiosk(false);
  win.setAlwaysOnTop(false);
  win.setFullScreen(false);
  win.setSkipTaskbar(false);

  globalShortcut.unregisterAll();

  if (!isDev) {
    win.webContents.reload();
  }

  return true;
});

// ============================================
// GET STATUS
// ============================================
ipcMain.handle('get-lockdown-status', async () => {
  return {
    isLocked,
    focusTimerEnd,
    remainingMs: focusTimerEnd ? Math.max(0, focusTimerEnd - Date.now()) : 0,
    lockdownStartTime,
  };
});

// ============================================
// STORAGE
// ============================================
const storage = new Map();

ipcMain.handle('storage:set', async (event, key, value) => { storage.set(key, value); return true; });
ipcMain.handle('storage:get', async (event, key) => storage.get(key) || null);
ipcMain.handle('storage:delete', async (event, key) => storage.delete(key));
ipcMain.handle('storage:clear', async () => { storage.clear(); return true; });
ipcMain.handle('clear-cache', async () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    await mainWindow.webContents.session.clearCache();
    await mainWindow.webContents.session.clearStorageData();
  }
  return true;
});

// ============================================
// APP LIFECYCLE
// ============================================
app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  globalShortcut.unregisterAll();
  if (focusTimerInterval) clearInterval(focusTimerInterval);
  if (powerSaveBlocker.isStarted(powerSaveBlockerId)) powerSaveBlocker.stop(powerSaveBlockerId);
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  isQuitting = true;
  globalShortcut.unregisterAll();
  if (focusTimerInterval) clearInterval(focusTimerInterval);
  if (powerSaveBlocker.isStarted(powerSaveBlockerId)) powerSaveBlocker.stop(powerSaveBlockerId);
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  if (focusTimerInterval) clearInterval(focusTimerInterval);
  if (powerSaveBlocker.isStarted(powerSaveBlockerId)) powerSaveBlocker.stop(powerSaveBlockerId);
});