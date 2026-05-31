const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  startLockdown: (options) => ipcRenderer.invoke('start-lockdown', options),
  endLockdown: () => ipcRenderer.invoke('end-lockdown'),
  getLockdownStatus: () => ipcRenderer.invoke('get-lockdown-status'),
  
  onLockdownAutoEnded: (callback) => ipcRenderer.on('lockdown-auto-ended', () => callback()),
  onLockdownForceEnded: (callback) => ipcRenderer.on('lockdown-force-ended', () => callback()),
  onLockdownRestore: (callback) => ipcRenderer.on('lockdown-restore', (event, data) => callback(data)),
  onLockdownExitBlocked: (callback) => ipcRenderer.on('lockdown-exit-blocked', () => callback()),
  
  removeAllLockdownListeners: () => {
    ipcRenderer.removeAllListeners('lockdown-auto-ended');
    ipcRenderer.removeAllListeners('lockdown-force-ended');
    ipcRenderer.removeAllListeners('lockdown-restore');
    ipcRenderer.removeAllListeners('lockdown-exit-blocked');
  },
  
  storage: {
    set: (key, value) => ipcRenderer.invoke('storage:set', key, value),
    get: (key) => ipcRenderer.invoke('storage:get', key),
    delete: (key) => ipcRenderer.invoke('storage:delete', key),
    clear: () => ipcRenderer.invoke('storage:clear'),
  },
  
  clearCache: () => ipcRenderer.invoke('clear-cache'),
});

contextBridge.exposeInMainWorld('appInfo', {
  version: '1.0.0',
  platform: process.platform,
  isDev: process.env.NODE_ENV === 'development',
});