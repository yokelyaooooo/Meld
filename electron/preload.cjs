'use strict'

const { contextBridge, ipcRenderer } = require('electron')

document.documentElement.dataset.platform = process.platform

contextBridge.exposeInMainWorld('meldDesktop', {
  platform: process.platform,
  getAISettings: () => ipcRenderer.invoke('meld:ai:get-settings'),
  saveAISettings: (value) => ipcRenderer.invoke('meld:ai:save-settings', value),
  clearApiKey: () => ipcRenderer.invoke('meld:ai:clear-key'),
  generateCustomization: (value) => ipcRenderer.invoke('meld:ai:customize', value),
})
