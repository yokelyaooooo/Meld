/// <reference types="vite/client" />

interface MeldAISettings {
  endpoint: string
  model: string
  hasApiKey: boolean
  secureStorage: boolean
}

interface MeldDesktopBridge {
  platform: string
  getAISettings(): Promise<MeldAISettings>
  saveAISettings(value: { endpoint: string; model: string; apiKey?: string }): Promise<MeldAISettings>
  clearApiKey(): Promise<MeldAISettings>
  generateCustomization(value: { prompt: string; workspace: unknown; currentMode: string }): Promise<unknown>
}

interface Window {
  meldDesktop?: MeldDesktopBridge
}
