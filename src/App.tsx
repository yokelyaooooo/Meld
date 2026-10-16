import { useEffect, useMemo, useState } from 'react'
import { ArrowUpRight, CloudOff, Menu, PanelRightOpen, Sparkles, Wifi } from 'lucide-react'
import { AgentPanel } from './components/AgentPanel'
import { Block } from './components/Blocks'
import { Sidebar } from './components/Sidebar'
import { proposePatch, validateRecipe } from './runtime/engine'
import { cloneRecipe } from './runtime/recipes'
import type { AuditEntry, Connectivity, InterfaceRecipe, PatchResult, Role } from './runtime/types'

const initialAudit: AuditEntry[] = [
  { id: 'a-1', at: '14:36', actor: 'system', action: 'Resident surface loaded', detail: 'Policy org.meld.relief@0.1', reversible: false },
]

function App() {
  const [recipe, setRecipe] = useState<InterfaceRecipe>(() => {
    const requested = new URLSearchParams(window.location.search).get('role')
    if (requested === 'resident' || requested === 'responder' || requested === 'coordinator') return cloneRecipe(requested)
    try {
      const saved = JSON.parse(localStorage.getItem('meld:active-recipe') ?? '') as InterfaceRecipe
      if (saved?.id && validateRecipe(saved).length === 0) return saved
    } catch {
      // A broken local draft should never prevent the safe default from loading.
    }
    return cloneRecipe('resident')
  })
  const [pending, setPending] = useState<PatchResult | null>(null)
  const [panelOpen, setPanelOpen] = useState(() => window.innerWidth > 900)
  const [audit, setAudit] = useState<AuditEntry[]>(initialAudit)
  const [versions, setVersions] = useState<InterfaceRecipe[]>([])
  const [toast, setToast] = useState<string | null>(null)

  const visibleRecipe = pending?.next ?? recipe
  const hasOffline = visibleRecipe.context.connectivity !== 'online'
  const title = useMemo(() => ({ resident: 'Good afternoon, Maya.', responder: 'Field run · Cedar 2', coordinator: 'North district overview' })[visibleRecipe.context.role], [visibleRecipe.context.role])
  const subtitle = useMemo(() => ({ resident: 'Here’s what matters near you right now.', responder: 'Three stops prioritized for risk, route, and supplies.', coordinator: 'A shared operational picture across every active team.' })[visibleRecipe.context.role], [visibleRecipe.context.role])

  useEffect(() => {
    localStorage.setItem('meld:active-recipe', JSON.stringify(recipe))
  }, [recipe])

  const changeRole = (role: Role) => {
    setPending(null)
    setVersions((items) => [...items, recipe])
    setRecipe(cloneRecipe(role))
    setAudit((items) => [{ id: crypto.randomUUID(), at: 'now', actor: 'you', action: `Switched to ${role} surface`, detail: 'Shared data stayed in place', reversible: true }, ...items])
  }

  const changeConnectivity = (connectivity: Connectivity) => {
    setRecipe((current) => ({ ...current, context: { ...current.context, connectivity } }))
    setToast(connectivity === 'offline' ? 'Offline mode · writes will queue locally' : 'Back online · changes synced')
    window.setTimeout(() => setToast(null), 2600)
  }

  const requestPatch = (prompt: string) => {
    setPending(proposePatch(recipe, prompt))
    setPanelOpen(true)
  }

  const applyPatch = () => {
    if (!pending || pending.status === 'blocked') return
    setVersions((items) => [...items, recipe])
    setRecipe({ ...pending.next, updatedAt: 'just now' })
    setAudit((items) => [{ id: pending.id, at: 'now', actor: 'local-agent', action: 'Applied interface patch', detail: pending.summary, reversible: true }, ...items])
    setPending(null)
    setToast('Interface reshaped · rollback available')
    window.setTimeout(() => setToast(null), 2600)
  }

  const revert = () => {
    const previous = versions.at(-1)
    if (!previous) return
    setRecipe(previous)
    setVersions((items) => items.slice(0, -1))
    setPending(null)
    setAudit((items) => [{ id: crypto.randomUUID(), at: 'now', actor: 'you', action: 'Reverted interface', detail: `Restored ${previous.name}`, reversible: false }, ...items])
    setToast('Last interface change reverted')
    window.setTimeout(() => setToast(null), 2200)
  }

  return (
    <div className={`app-shell density-${visibleRecipe.context.density} ${visibleRecipe.context.highContrast ? 'high-contrast' : ''}`}>
      <Sidebar role={visibleRecipe.context.role} connectivity={visibleRecipe.context.connectivity} onRoleChange={changeRole} onConnectivityChange={changeConnectivity} />
      <main className="workspace">
        <header className="topbar">
          <button className="mobile-menu" aria-label="Open menu"><Menu size={19} /></button>
          <div className="incident-chip"><span className="live-dot" /> Northbank flood response <small>DAY 02</small></div>
          <div className="topbar-actions">
            <span className={`network-state ${hasOffline ? 'offline' : ''}`}>{hasOffline ? <CloudOff size={14} /> : <Wifi size={14} />}{hasOffline ? 'Offline-ready' : 'Synced 12s ago'}</span>
            <span className="divider" />
            <button className="share-button">Share view <ArrowUpRight size={14} /></button>
            <button className={`shape-button ${panelOpen ? 'active' : ''}`} onClick={() => setPanelOpen(!panelOpen)}><Sparkles size={15} /> Shape this view</button>
          </div>
        </header>

        <div className="workspace-scroll">
          <section className="page-intro">
            <div><p className="page-kicker"><span>{visibleRecipe.context.role}</span> · recipe {visibleRecipe.id.split('-').slice(0, 2).join('-')}</p><h1>{title}</h1><p>{subtitle}</p></div>
            <button className="mobile-shape" onClick={() => setPanelOpen(true)}><PanelRightOpen size={18} /> Shape</button>
          </section>

          {pending && <div className="preview-ribbon"><span><Sparkles size={15} /> Previewing an unapplied interface patch</span><button onClick={() => setPending(null)}>Return to current</button></div>}

          <section className={`recipe-grid role-${visibleRecipe.context.role}`} key={visibleRecipe.id}>
            {visibleRecipe.blocks.map((block) => <div className={`block-slot span-${block.span}`} key={block.id}><Block block={block} recipe={visibleRecipe} /></div>)}
          </section>

          <footer className="canvas-footer"><span>MELD RECIPE</span><code>{visibleRecipe.id}</code><i /> <span>{visibleRecipe.blocks.length} BLOCKS</span><i /><span>{visibleRecipe.context.connectivity.toUpperCase()}</span><strong>Every surface is a reversible view of shared capabilities.</strong></footer>
        </div>
      </main>
      <AgentPanel open={panelOpen} recipe={recipe} pending={pending} audit={audit} onClose={() => setPanelOpen(false)} onPrompt={requestPatch} onApply={applyPatch} onDiscard={() => setPending(null)} onRevert={revert} />
      {toast && <div className="toast"><span>✓</span>{toast}</div>}
    </div>
  )
}

export default App
