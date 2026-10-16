import { useEffect, useState } from 'react'
import { ArrowRight, Check, KeyRound, LockKeyhole, Settings2, ShieldCheck, Sparkles, Trash2, X } from 'lucide-react'
import { customizationSummary, defaultCustomization, validateCustomization } from './customization'
import { proposeTraceMode } from './store'
import type { TraceCustomization, TraceMode, TraceWorkspace } from './types'

export function SettingsModal({ onClose, onSaved }: { onClose: () => void; onSaved: (settings: MeldAISettings) => void }) {
  const desktop = window.meldDesktop
  const [settings, setSettings] = useState<MeldAISettings>({ endpoint: 'https://api.openai.com/v1/responses', model: 'gpt-6-astra', hasApiKey: false, secureStorage: false })
  const [apiKey, setApiKey] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    desktop?.getAISettings().then(setSettings).catch((value) => setError(String(value?.message ?? value)))
  }, [desktop])

  const save = async () => {
    if (!desktop) return
    setBusy(true)
    setError('')
    try {
      const result = await desktop.saveAISettings({ endpoint: settings.endpoint, model: settings.model, ...(apiKey.trim() ? { apiKey } : {}) })
      setSettings(result)
      setApiKey('')
      onSaved(result)
      onClose()
    } catch (value) {
      setError(value instanceof Error ? value.message : String(value))
    } finally {
      setBusy(false)
    }
  }

  const clearKey = async () => {
    if (!desktop) return
    setBusy(true)
    try {
      const result = await desktop.clearApiKey()
      setSettings(result)
      setApiKey('')
      onSaved(result)
    } catch (value) {
      setError(value instanceof Error ? value.message : String(value))
    } finally {
      setBusy(false)
    }
  }

  return <div className="trace-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section className="trace-modal ai-settings-modal" role="dialog" aria-modal="true" aria-label="AI provider settings">
      <header><div><p className="trace-eyebrow">Desktop intelligence</p><h2>AI provider</h2></div><button onClick={onClose}><X size={18} /></button></header>
      {!desktop ? <div className="desktop-required"><Settings2 size={24} /><div><strong>Open the Electron desktop app</strong><p>Browser mode keeps the deterministic local reshaper. API credentials are intentionally unavailable here.</p></div></div> : <>
        <div className={`vault-status ${settings.secureStorage ? 'ready' : ''}`}><LockKeyhole size={18} /><div><strong>{settings.secureStorage ? 'System credential vault available' : 'Credential vault unavailable'}</strong><p>{settings.hasApiKey ? 'A key is saved. Its value can never be read back by the interface.' : 'No key saved yet.'}</p></div></div>
        <label>Responses endpoint<input value={settings.endpoint} onChange={(event) => setSettings({ ...settings, endpoint: event.target.value })} spellCheck={false} /></label>
        <label>Model<input value={settings.model} onChange={(event) => setSettings({ ...settings, model: event.target.value })} spellCheck={false} /></label>
        <label>API key<input type="password" autoComplete="off" value={apiKey} onChange={(event) => setApiKey(event.target.value)} placeholder={settings.hasApiKey ? 'Saved — enter a new key to replace it' : 'sk-…'} /></label>
        <div className="key-boundary"><ShieldCheck size={15} /><p>The key is encrypted by macOS Keychain or Windows DPAPI in the Electron main process. It is never placed in localStorage, workspace exports, or the renderer.</p></div>
        {error && <p className="form-error">{error}</p>}
        <footer className="settings-footer"><button className="danger-quiet" disabled={!settings.hasApiKey || busy} onClick={clearKey}><Trash2 size={14} /> Forget key</button><span /><button onClick={onClose}>Cancel</button><button className="primary" disabled={busy || !settings.endpoint.trim() || !settings.model.trim()} onClick={save}>{busy ? 'Saving…' : 'Save securely'} <ArrowRight size={15} /></button></footer>
      </>}
    </section>
  </div>
}

export function ShapePopover({ workspace, mode, settings, onOpenSettings, onApply, onClose }: {
  workspace: TraceWorkspace
  mode: TraceMode
  settings: MeldAISettings | null
  onOpenSettings: () => void
  onApply: (customization: TraceCustomization) => void
  onClose: () => void
}) {
  const [prompt, setPrompt] = useState('')
  const [proposal, setProposal] = useState<TraceCustomization | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const desktopReady = Boolean(window.meldDesktop && settings?.hasApiKey)

  const generate = async () => {
    const intent = prompt.trim()
    if (!intent || busy) return
    setBusy(true)
    setError('')
    setProposal(null)
    try {
      if (desktopReady && window.meldDesktop) {
        const result = await window.meldDesktop.generateCustomization({ prompt: intent, workspace, currentMode: mode })
        if (!validateCustomization(result)) throw new Error('The desktop bridge rejected an unsafe interface recipe.')
        setProposal(result)
      } else {
        const local = proposeTraceMode(intent, mode)
        setProposal({ ...defaultCustomization, mode: local.mode, surfaceTitle: local.mode === 'read' ? 'Deep read' : local.mode === 'synthesize' ? 'Synthesize' : 'Build brief', rationale: local.reason, inspector: local.mode !== 'read', guidance: ['Local reshaping is active. Add an API key in the desktop app for richer intent-aware layouts.'] })
      }
    } catch (value) {
      setError(value instanceof Error ? value.message : String(value))
    } finally {
      setBusy(false)
    }
  }

  return <section className="shape-popover ai-shape-popover">
    <header><div><span><Sparkles size={16} /></span><p><strong>Shape this workspace</strong>Describe the job; Meld proposes a bounded, reversible interface.</p></div><button onClick={onClose} aria-label="Close reshape"><X size={15} /></button></header>
    <div className="shape-input"><input autoFocus maxLength={800} value={prompt} onChange={(event) => setPrompt(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') generate() }} placeholder="Compare only high-confidence contradictions in a compact view…" /><button onClick={generate} disabled={!prompt.trim() || busy}>{busy ? <span className="busy-dot" /> : <ArrowRight size={16} />}</button></div>
    <div className="shape-provider"><span className={desktopReady ? 'online' : ''}><i /> {desktopReady ? settings?.model : 'Local safe mode'}</span><button onClick={onOpenSettings}><KeyRound size={12} /> {desktopReady ? 'Provider settings' : 'Add API key'}</button></div>
    {error && <p className="shape-error">{error}</p>}
    {proposal && <div className="proposal-preview">
      <div className="proposal-kicker"><span>PREVIEW · DATA UNCHANGED</span><ShieldCheck size={14} /></div>
      <h3>{proposal.surfaceTitle}</h3>
      <p>{proposal.rationale}</p>
      <div className="proposal-chips">{customizationSummary(proposal).map((item) => <span key={item}>{item}</span>)}</div>
      <ul>{proposal.guidance.map((item) => <li key={item}><Check size={12} /> {item}</li>)}</ul>
      <footer><button onClick={() => setProposal(null)}>Discard</button><button className="apply-proposal" onClick={() => onApply(proposal)}>Apply interface <ArrowRight size={14} /></button></footer>
    </div>}
    <small className="shape-boundary">Allowed: mode, density, accent, evidence lens, source order, inspector, guidance. No generated code is executed.</small>
  </section>
}
