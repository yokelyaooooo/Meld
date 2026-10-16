import { useState } from 'react'
import { ArrowRight, Bot, Check, ChevronDown, FileDiff, LockKeyhole, RotateCcw, ShieldCheck, Sparkles, X } from 'lucide-react'
import type { AuditEntry, InterfaceRecipe, PatchResult } from '../runtime/types'

interface AgentPanelProps {
  open: boolean
  recipe: InterfaceRecipe
  pending: PatchResult | null
  audit: AuditEntry[]
  onClose: () => void
  onPrompt: (prompt: string) => void
  onApply: () => void
  onDiscard: () => void
  onRevert: () => void
}

const suggestions = [
  'I’m a field volunteer, one hand, patchy signal',
  'Make this calm for an older resident',
  'Prioritize medical needs in bright sunlight',
]

export function AgentPanel({ open, recipe, pending, audit, onClose, onPrompt, onApply, onDiscard, onRevert }: AgentPanelProps) {
  const [prompt, setPrompt] = useState('')
  const [showAudit, setShowAudit] = useState(false)
  const submit = () => {
    if (!prompt.trim()) return
    onPrompt(prompt.trim())
    setPrompt('')
  }

  return (
    <aside className={`agent-panel ${open ? 'open' : ''}`}>
      <header className="agent-header">
        <div className="agent-identity"><span><Sparkles size={17} /></span><div><strong>Shape with Meld</strong><small>local policy engine</small></div></div>
        <button className="icon-button panel-close" onClick={onClose} aria-label="Close agent panel"><X size={18} /></button>
      </header>

      <div className="agent-body">
        <section className="contract-note">
          <LockKeyhole size={17} />
          <p><strong>The agent can reshape this surface.</strong><br />It cannot add permissions or bypass role policy.</p>
        </section>

        {!pending ? (
          <>
            <div className="agent-greeting">
              <div className="mini-orb"><Bot size={19} /></div>
              <p>What situation should <strong>{recipe.name}</strong> fit?</p>
            </div>
            <div className="suggestion-list">
              {suggestions.map((suggestion) => <button key={suggestion} onClick={() => setPrompt(suggestion)}>{suggestion}<ArrowRight size={14} /></button>)}
            </div>
          </>
        ) : (
          <section className="patch-preview">
            <div className="patch-title"><span className={pending.status}><ShieldCheck size={17} /></span><div><small>PROPOSED PATCH</small><h3>{pending.next.name}</h3></div></div>
            <p className="patch-summary">{pending.summary}</p>
            <div className="diff-list">
              {pending.operations.map((item, index) => (
                <div className="diff-row" key={`${item.path}-${index}`}>
                  <span className={item.op}>{item.op === 'add' ? '+' : item.op === 'remove' ? '−' : '↻'}</span>
                  <div><strong>{item.path.replaceAll('/', ' / ')}</strong><small>{item.reason}</small></div>
                </div>
              ))}
            </div>
            <div className="permission-proof"><Check size={14} /> Permissions unchanged <span>{recipe.context.role}</span></div>
            <div className="patch-actions"><button onClick={onDiscard}>Discard</button><button className="apply-button" onClick={onApply}>Apply patch <Sparkles size={15} /></button></div>
          </section>
        )}

        <button className="audit-toggle" onClick={() => setShowAudit(!showAudit)}><span><FileDiff size={16} /> Change ledger</span><ChevronDown size={16} className={showAudit ? 'turned' : ''} /></button>
        {showAudit && <div className="audit-list">
          {audit.slice(0, 4).map((entry) => <div key={entry.id}><span className="audit-dot" /><p><strong>{entry.action}</strong><small>{entry.detail} · {entry.at}</small></p></div>)}
          {audit.length > 1 && <button className="revert-link" onClick={onRevert}><RotateCcw size={13} /> Revert last applied patch</button>}
        </div>}
      </div>

      <div className="composer">
        <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); submit() } }} placeholder="Describe your role, constraints, or goal…" />
        <div><span>⌘ ↵ to shape</span><button onClick={submit} aria-label="Propose interface patch"><ArrowRight size={17} /></button></div>
      </div>
    </aside>
  )
}
