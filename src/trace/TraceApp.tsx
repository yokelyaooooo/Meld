import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  CircleDot,
  Columns3,
  Database,
  Download,
  ExternalLink,
  FileDown,
  FileText,
  Filter,
  GraduationCap,
  Library,
  Link2,
  Menu,
  PanelRightClose,
  PanelRightOpen,
  Plus,
  Quote,
  RotateCcw,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { SettingsModal, ShapePopover } from './AIControls'
import { shapeWorkspace } from './customization'
import { traceRecipes } from './demo'
import {
  addEvidence,
  addSource,
  cloneDemoWorkspace,
  createEmptyWorkspace,
  loadWorkspace,
  removeSource,
  saveWorkspace,
  validateWorkspace,
  workspaceToMarkdown,
} from './store'
import type { EvidenceItem, EvidenceStance, TraceCustomization, TraceMode, TraceSource, TraceWorkspace } from './types'
import './trace.css'
import './harness.css'

const modeIcons = { read: BookOpen, synthesize: Columns3, brief: FileText }
const palette = ['#e45f3a', '#2e6dd8', '#16a078', '#9b63d4', '#d59a18', '#cb4572']

function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = name
  anchor.click()
  URL.revokeObjectURL(url)
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 36) || crypto.randomUUID()
}

function Logo() {
  return <div className="trace-logo"><span><i /><i /><i /></span><strong>Meld</strong><em>/ Trace</em></div>
}

function ReadView({ workspace, search, onSelect, onNotes, onCapture, onDeleteEvidence }: {
  workspace: TraceWorkspace
  search: string
  onSelect: (id: string) => void
  onNotes: (notes: string) => void
  onCapture: () => void
  onDeleteEvidence: (id: string) => void
}) {
  const [revealed, setRevealed] = useState(false)
  const active = workspace.sources.find((source) => source.id === workspace.activeSourceId) ?? workspace.sources[0]
  const evidence = workspace.evidence.filter((item) => item.sourceId === active?.id && (!search || item.claim.toLowerCase().includes(search.toLowerCase())))

  if (!active) return <EmptyState title="Your reading desk is empty" body="Add a source to start building a traceable evidence base." onAction={onCapture} action="Add first source" />

  return <div className="trace-read-view view-enter">
    <div className="source-tabs" role="tablist" aria-label="Sources">
      {workspace.sources.map((source, index) => <button key={source.id} className={source.id === active.id ? 'active' : ''} onClick={() => onSelect(source.id)}>
        <span style={{ background: source.color }}>{String(index + 1).padStart(2, '0')}</span>
        <div><strong>{source.title}</strong><small>{source.authors} · {source.year}</small></div>
      </button>)}
      <button className="new-source-tab" onClick={onCapture}><Plus size={15} /> Add source</button>
    </div>

    <article className="reading-paper">
      <div className="paper-index" style={{ color: active.color }}>SOURCE / {workspace.sources.findIndex((item) => item.id === active.id) + 1}</div>
      <header className="reading-header">
        <div><p>{active.authors.toUpperCase()} · {active.year}</p><h2>{active.title}</h2></div>
        <a href={active.url} target="_blank" rel="noreferrer">Open original <ExternalLink size={15} /></a>
      </header>
      <div className="reading-columns">
        <section className="source-abstract">
          <label>WORKING ABSTRACT</label>
          <p>{active.summary}</p>
          <div className="source-tags">{active.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>
        </section>
        <section className="margin-note">
          <label>YOUR MARGIN NOTE</label>
          <textarea aria-label="Notes for active source" value={active.notes} onChange={(event) => onNotes(event.target.value)} placeholder="What changes your understanding?" />
          <small>Saved locally as you type</small>
        </section>
      </div>
      <section className="evidence-section">
        <header><div><label>CAPTURED EVIDENCE</label><h3>{evidence.length} traceable claim{evidence.length === 1 ? '' : 's'}</h3></div><button onClick={onCapture}><Plus size={15} /> Capture</button></header>
        {evidence.map((item, index) => <article className={`evidence-slip ${item.stance}`} key={item.id}>
          <span className="slip-number">{String(index + 1).padStart(2, '0')}</span>
          <div><p>{item.claim}</p><small><span>{item.theme}</span>{item.location} · confidence {item.confidence}/5</small></div>
          <Quote size={17} />
          <button aria-label="Delete evidence" onClick={() => onDeleteEvidence(item.id)}><Trash2 size={14} /></button>
        </article>)}
        {!evidence.length && <p className="no-results">No captured evidence matches this search.</p>}
      </section>
    </article>

    <section className={`recall-card ${revealed ? 'revealed' : ''}`}>
      <div className="recall-mark"><GraduationCap size={22} /></div>
      <div><label>ACTIVE RECALL</label><h3>Close the paper. What is the strongest claim and its main boundary condition?</h3>
        {revealed && <p>{evidence[0]?.claim ?? active.summary} {evidence.find((item) => item.stance === 'challenges' || item.stance === 'context')?.claim ?? 'Look for a context or challenge before generalizing.'}</p>}
      </div>
      <button onClick={() => setRevealed(!revealed)}>{revealed ? 'Hide answer' : 'Reveal from evidence'} <ChevronRight size={15} /></button>
    </section>
  </div>
}

function SynthesisView({ workspace, search, onToggle, onCapture }: {
  workspace: TraceWorkspace
  search: string
  onToggle: (id: string) => void
  onCapture: () => void
}) {
  const themes = Array.from(new Set(workspace.evidence.map((item) => item.theme)))
  const filtered = workspace.evidence.filter((item) => !search || `${item.theme} ${item.claim}`.toLowerCase().includes(search.toLowerCase()))
  const conflictThemes = themes.filter((theme) => {
    const stances = filtered.filter((item) => item.theme === theme).map((item) => item.stance)
    return stances.includes('supports') && stances.includes('challenges')
  })

  return <div className="synthesis-view view-enter">
    <section className="synthesis-intro">
      <div><p className="trace-eyebrow">Evidence map</p><h2>Where the literature agrees — and where it bends.</h2></div>
      <div className="synthesis-stats"><span><strong>{workspace.sources.length}</strong> sources</span><span><strong>{themes.length}</strong> themes</span><span><strong>{conflictThemes.length}</strong> tensions</span></div>
    </section>

    <section className="matrix-card">
      <div className="matrix-toolbar"><div><CircleDot size={15} /><span className="support-key" /> supports <span className="challenge-key" /> challenges <span className="context-key" /> context</div><button onClick={onCapture}><Plus size={14} /> Add evidence</button></div>
      <div className="evidence-matrix" style={{ '--theme-count': Math.max(themes.length, 1) } as React.CSSProperties}>
        <div className="matrix-corner">SOURCE × THEME</div>
        {themes.map((theme) => <div className="theme-head" key={theme}><span>{theme}</span></div>)}
        {workspace.sources.map((source, sourceIndex) => <div className="matrix-row" key={source.id}>
          <div className="matrix-source"><span style={{ background: source.color }}>{String(sourceIndex + 1).padStart(2, '0')}</span><div><strong>{source.title}</strong><small>{source.authors} · {source.year}</small></div></div>
          {themes.map((theme) => {
            const items = filtered.filter((item) => item.sourceId === source.id && item.theme === theme)
            return <div className={`matrix-cell ${items.length ? 'filled' : ''}`} key={theme}>
              {items.length ? items.map((item) => <button title={item.claim} className={item.stance} key={item.id} onClick={() => onToggle(item.id)}><span>{item.included ? <Check size={12} /> : null}</span><p>{item.claim}</p><small>{item.location}</small></button>) : <span className="empty-cell">—</span>}
            </div>
          })}
        </div>)}
      </div>
    </section>

    <div className="synthesis-bottom">
      <section className="tension-card">
        <header><div><p className="trace-eyebrow">Productive tension</p><h3>{conflictThemes.length ? 'Claims that need a narrower conclusion' : 'No direct contradictions yet'}</h3></div><Target size={21} /></header>
        {conflictThemes.map((theme) => <div className="tension-row" key={theme}><strong>{theme}</strong><p>{filtered.filter((item) => item.theme === theme).map((item) => item.claim).join(' ↔ ')}</p></div>)}
        {!conflictThemes.length && <p>Add a challenging claim to keep the synthesis honest.</p>}
      </section>
      <section className="gap-card">
        <header><div><p className="trace-eyebrow">Coverage gaps</p><h3>What to read next</h3></div><Filter size={19} /></header>
        {themes.slice(0, 4).map((theme) => {
          const count = new Set(filtered.filter((item) => item.theme === theme).map((item) => item.sourceId)).size
          return <div className="coverage-row" key={theme}><span>{theme}</span><div><i style={{ width: `${workspace.sources.length ? count / workspace.sources.length * 100 : 0}%` }} /></div><small>{count}/{workspace.sources.length}</small></div>
        })}
      </section>
    </div>
  </div>
}

function BriefView({ workspace, onChange, onToggle, onExport }: {
  workspace: TraceWorkspace
  onChange: (field: 'title' | 'question' | 'thesis', value: string) => void
  onToggle: (id: string) => void
  onExport: () => void
}) {
  const included = workspace.evidence.filter((item) => item.included)
  return <div className="brief-view view-enter">
    <section className="brief-editor">
      <div className="brief-ruler"><span>ARGUMENT / 01</span><i /><span>{included.length} CITATIONS</span></div>
      <input className="brief-title-input" value={workspace.title} onChange={(event) => onChange('title', event.target.value)} aria-label="Brief title" />
      <label className="brief-field-label">QUESTION</label>
      <textarea className="question-input" value={workspace.question} onChange={(event) => onChange('question', event.target.value)} aria-label="Research question" />
      <label className="brief-field-label">WORKING POSITION</label>
      <textarea className="thesis-input" value={workspace.thesis} onChange={(event) => onChange('thesis', event.target.value)} placeholder="Write the narrowest conclusion the evidence can support…" aria-label="Working position" />
      <section className="argument-stack">
        <header><p className="trace-eyebrow">Selected evidence</p><span>Click × to remove from this brief</span></header>
        {included.map((item, index) => {
          const source = workspace.sources.find((entry) => entry.id === item.sourceId)
          return <article className="argument-block" key={item.id}>
            <span className={`argument-index ${item.stance}`}>{String(index + 1).padStart(2, '0')}</span>
            <div><em>{item.theme} · {item.stance}</em><p>{item.claim}</p><small>{source?.authors}, {source?.year} · {item.location}</small></div>
            <button onClick={() => onToggle(item.id)} aria-label="Remove from brief"><X size={15} /></button>
          </article>
        })}
        {!included.length && <p className="no-results">Select evidence in Synthesize mode to build the argument.</p>}
      </section>
      <footer className="brief-footer"><span>Built from traceable evidence, not generated prose.</span><button onClick={onExport}><FileDown size={15} /> Export Markdown</button></footer>
    </section>
  </div>
}

function EmptyState({ title, body, action, onAction }: { title: string; body: string; action: string; onAction: () => void }) {
  return <div className="trace-empty"><Library size={31} /><h2>{title}</h2><p>{body}</p><button onClick={onAction}><Plus size={15} /> {action}</button></div>
}

function SourceModal({ onClose, onSave }: { onClose: () => void; onSave: (source: TraceSource) => void }) {
  const [form, setForm] = useState({ title: '', authors: '', year: new Date().getFullYear(), url: '', summary: '', tags: '' })
  const valid = form.title.trim() && form.authors.trim()
  const set = (field: keyof typeof form, value: string | number) => setForm((current) => ({ ...current, [field]: value }))
  return <div className="trace-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section className="trace-modal" role="dialog" aria-modal="true" aria-label="Add source">
      <header><div><p className="trace-eyebrow">New source</p><h2>Add to the evidence base</h2></div><button onClick={onClose}><X size={18} /></button></header>
      <label>Title<input autoFocus value={form.title} onChange={(event) => set('title', event.target.value)} placeholder="Paper, report, interview, or book" /></label>
      <div className="modal-grid"><label>Author(s)<input value={form.authors} onChange={(event) => set('authors', event.target.value)} placeholder="Family name or organization" /></label><label>Year<input type="number" value={form.year} onChange={(event) => set('year', Number(event.target.value))} /></label></div>
      <label>Source URL<input value={form.url} onChange={(event) => set('url', event.target.value)} placeholder="https://…" /></label>
      <label>Working abstract<textarea value={form.summary} onChange={(event) => set('summary', event.target.value)} placeholder="Summarize what this source actually examines." /></label>
      <label>Tags<input value={form.tags} onChange={(event) => set('tags', event.target.value)} placeholder="methods, topic, population" /></label>
      <footer><button onClick={onClose}>Cancel</button><button className="primary" disabled={!valid} onClick={() => onSave({ id: `${slug(form.title)}-${Date.now().toString(36)}`, title: form.title.trim(), authors: form.authors.trim(), year: form.year, url: form.url.trim(), summary: form.summary.trim(), tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean), notes: '', color: palette[Math.floor(Math.random() * palette.length)] })}>Add source <ArrowRight size={15} /></button></footer>
    </section>
  </div>
}

function Inspector({ mode, workspace, activeSource, onAddEvidence, onDeleteSource, onExport, onImport, onRestore, onNew, onClose }: {
  mode: TraceMode
  workspace: TraceWorkspace
  activeSource?: TraceSource
  onAddEvidence: (item: EvidenceItem) => void
  onDeleteSource: (id: string) => void
  onExport: (kind: 'json' | 'markdown') => void
  onImport: () => void
  onRestore: () => void
  onNew: () => void
  onClose: () => void
}) {
  const [draft, setDraft] = useState({ sourceId: activeSource?.id ?? workspace.sources[0]?.id ?? '', theme: '', claim: '', location: '', stance: 'supports' as EvidenceStance, confidence: 4 as 1 | 2 | 3 | 4 | 5 })
  useEffect(() => { if (activeSource?.id) setDraft((current) => ({ ...current, sourceId: activeSource.id })) }, [activeSource?.id])
  const set = <K extends keyof typeof draft>(field: K, value: typeof draft[K]) => setDraft((current) => ({ ...current, [field]: value }))
  const save = () => {
    if (!draft.sourceId || !draft.theme.trim() || !draft.claim.trim()) return
    onAddEvidence({ id: crypto.randomUUID(), sourceId: draft.sourceId, theme: draft.theme.trim(), claim: draft.claim.trim(), location: draft.location.trim() || 'Personal note', stance: draft.stance, confidence: draft.confidence, included: true })
    setDraft((current) => ({ ...current, theme: '', claim: '', location: '' }))
  }

  return <aside className="trace-inspector">
    <button className="inspector-mobile-close" onClick={onClose}><X size={16} /> Close inspector</button>
    {mode === 'read' && activeSource && <>
      <header><p className="trace-eyebrow">Source card</p><h3>Provenance</h3></header>
      <div className="provenance-card"><span style={{ background: activeSource.color }} /><strong>{activeSource.authors}</strong><small>{activeSource.year} · {activeSource.tags.join(' · ') || 'untagged'}</small><a href={activeSource.url} target="_blank" rel="noreferrer"><Link2 size={14} /> Visit source</a></div>
      <div className="inspector-section"><label>CAPTURE HEALTH</label><div className="health-stat"><span><strong>{workspace.evidence.filter((item) => item.sourceId === activeSource.id).length}</strong> claims</span><span><strong>{new Set(workspace.evidence.filter((item) => item.sourceId === activeSource.id).map((item) => item.theme)).size}</strong> themes</span></div></div>
      <button className="inspector-danger" onClick={() => onDeleteSource(activeSource.id)}><Trash2 size={14} /> Remove source and its evidence</button>
    </>}

    {mode === 'synthesize' && <>
      <header><p className="trace-eyebrow">Evidence capture</p><h3>Pin a claim to its source</h3></header>
      <label className="inspector-label">SOURCE<select value={draft.sourceId} onChange={(event) => set('sourceId', event.target.value)}>{workspace.sources.map((source) => <option value={source.id} key={source.id}>{source.title}</option>)}</select></label>
      <label className="inspector-label">THEME<input value={draft.theme} onChange={(event) => set('theme', event.target.value)} list="trace-themes" placeholder="e.g. Boundary conditions" /><datalist id="trace-themes">{Array.from(new Set(workspace.evidence.map((item) => item.theme))).map((theme) => <option key={theme}>{theme}</option>)}</datalist></label>
      <label className="inspector-label">CLAIM<textarea value={draft.claim} onChange={(event) => set('claim', event.target.value)} placeholder="Paraphrase one atomic, falsifiable idea." /></label>
      <label className="inspector-label">LOCATION<input value={draft.location} onChange={(event) => set('location', event.target.value)} placeholder="p. 18, Results, 24:10…" /></label>
      <div className="stance-picker">{(['supports', 'challenges', 'context'] as EvidenceStance[]).map((stance) => <button className={draft.stance === stance ? `selected ${stance}` : ''} key={stance} onClick={() => set('stance', stance)}>{stance}</button>)}</div>
      <label className="confidence-label">CONFIDENCE <strong>{draft.confidence}/5</strong><input type="range" min="1" max="5" value={draft.confidence} onChange={(event) => set('confidence', Number(event.target.value) as 1 | 2 | 3 | 4 | 5)} /></label>
      <button className="capture-button" onClick={save} disabled={!draft.sourceId || !draft.theme.trim() || !draft.claim.trim()}><Quote size={15} /> Capture evidence</button>
    </>}

    {mode === 'brief' && <>
      <header><p className="trace-eyebrow">Brief health</p><h3>Can this argument travel?</h3></header>
      <div className="brief-health">
        <div><span>Selected claims</span><strong>{workspace.evidence.filter((item) => item.included).length}</strong></div>
        <div><span>Source diversity</span><strong>{new Set(workspace.evidence.filter((item) => item.included).map((item) => item.sourceId)).size}/{workspace.sources.length}</strong></div>
        <div><span>Challenges kept</span><strong>{workspace.evidence.filter((item) => item.included && item.stance === 'challenges').length}</strong></div>
      </div>
      <div className="honesty-check"><ShieldCheck size={18} /><p><strong>Trace check</strong>Your brief keeps at least one link back to every included source.</p></div>
      <button className="capture-button" onClick={() => onExport('markdown')}><FileDown size={15} /> Export Markdown brief</button>
    </>}

    <div className="data-tools"><label>WORKSPACE DATA</label><button onClick={onNew}><Plus size={14} /> New blank workspace</button><button onClick={() => onExport('json')}><Download size={14} /> Export backup</button><button onClick={onImport}><Upload size={14} /> Import workspace</button><button onClick={onRestore}><RotateCcw size={14} /> Restore demo</button></div>
  </aside>
}

export default function TraceApp() {
  const [workspace, setWorkspace] = useState<TraceWorkspace>(() => loadWorkspace())
  const [mode, setMode] = useState<TraceMode>(() => {
    const requested = new URLSearchParams(window.location.search).get('mode')
    return requested === 'synthesize' || requested === 'brief' ? requested : 'read'
  })
  const [search, setSearch] = useState('')
  const [inspectorOpen, setInspectorOpen] = useState(() => window.innerWidth > 980)
  const [sourceModal, setSourceModal] = useState(false)
  const [shapeOpen, setShapeOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [aiSettings, setAISettings] = useState<MeldAISettings | null>(null)
  const [customization, setCustomization] = useState<TraceCustomization | null>(null)
  const [undoShape, setUndoShape] = useState<{ customization: TraceCustomization | null; mode: TraceMode; inspectorOpen: boolean } | null>(null)
  const [railOpen, setRailOpen] = useState(false)
  const [toast, setToast] = useState('')
  const importRef = useRef<HTMLInputElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const displayWorkspace = useMemo(() => customization ? shapeWorkspace(workspace, customization) : workspace, [workspace, customization])
  const activeSource = workspace.sources.find((source) => source.id === workspace.activeSourceId) ?? workspace.sources[0]
  const recipe = traceRecipes[mode]

  useEffect(() => saveWorkspace(workspace), [workspace])
  useEffect(() => { window.meldDesktop?.getAISettings().then(setAISettings).catch(() => undefined) }, [])
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchRef.current?.focus()
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'i') {
        event.preventDefault()
        setShapeOpen((open) => !open)
      }
      if (event.key === 'Escape') {
        setShapeOpen(false)
        setSettingsOpen(false)
        setRailOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(''), 2400) }

  const updateNotes = (notes: string) => setWorkspace((current) => ({ ...current, sources: current.sources.map((source) => source.id === current.activeSourceId ? { ...source, notes } : source) }))
  const toggleEvidence = (id: string) => setWorkspace((current) => ({ ...current, evidence: current.evidence.map((item) => item.id === id ? { ...item, included: !item.included } : item) }))
  const changeBrief = (field: 'title' | 'question' | 'thesis', value: string) => setWorkspace((current) => ({ ...current, [field]: value }))

  const applyShape = (proposal: TraceCustomization) => {
    setUndoShape({ customization, mode, inspectorOpen })
    setCustomization(proposal)
    setMode(proposal.mode)
    setInspectorOpen(proposal.inspector)
    setShapeOpen(false)
    notify(`Interface reshaped · ${proposal.surfaceTitle}`)
  }

  const revertShape = () => {
    if (!undoShape) return
    setCustomization(undoShape.customization)
    setMode(undoShape.mode)
    setInspectorOpen(undoShape.inspectorOpen)
    setUndoShape(null)
    notify('Previous interface restored')
  }

  const exportWorkspace = (kind: 'json' | 'markdown') => {
    if (kind === 'json') download(`${slug(workspace.title)}.trace.json`, JSON.stringify(workspace, null, 2), 'application/json')
    else download(`${slug(workspace.title)}.md`, workspaceToMarkdown(workspace), 'text/markdown')
    notify(kind === 'json' ? 'Workspace backup downloaded' : 'Cited brief downloaded')
  }

  const importWorkspace = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const value = JSON.parse(String(reader.result))
        if (!validateWorkspace(value)) throw new Error('Invalid Trace workspace')
        setWorkspace(value)
        notify('Workspace imported')
      } catch {
        notify('Import failed · choose a valid .trace.json file')
      }
    }
    reader.readAsText(file)
  }

  const filteredSources = useMemo(() => workspace.sources.filter((source) => !search || `${source.title} ${source.authors} ${source.tags.join(' ')}`.toLowerCase().includes(search.toLowerCase())), [workspace.sources, search])

  return <div className={`trace-app trace-mode-${mode} trace-density-${customization?.density ?? 'balanced'} trace-accent-${customization?.accent ?? 'ember'} ${inspectorOpen ? 'inspector-open' : ''} ${railOpen ? 'rail-open' : ''}`}>
    <header className="trace-windowbar">
      <div className="window-brand"><Logo /></div>
      <div className="window-context"><span><i /> Meld runtime</span><strong>{workspace.title}</strong></div>
      <div className="window-environment">{window.meldDesktop ? `${window.meldDesktop.platform} desktop` : 'web preview'}</div>
    </header>
    <aside className="trace-rail">
      <button className="rail-close" aria-label="Close navigation" onClick={() => setRailOpen(false)}><X size={17} /></button>
      <div className="workspace-identity"><small>WORKSPACE</small><strong>{workspace.title}</strong><span><i /> Saved locally</span></div>
      <nav className="trace-modes" aria-label="Workspace modes">
        {(Object.keys(traceRecipes) as TraceMode[]).map((item, index) => {
          const Icon = modeIcons[item]
          return <button key={item} className={mode === item ? 'active' : ''} onClick={() => { setMode(item); setRailOpen(false) }}><span>0{index + 1}</span><Icon size={18} /><div><strong>{traceRecipes[item].label}</strong><small>{traceRecipes[item].description}</small></div></button>
        })}
      </nav>
      <section className="rail-sources"><header><span>SOURCES · {workspace.sources.length}</span><button onClick={() => setSourceModal(true)}><Plus size={14} /></button></header>
        {filteredSources.map((source) => <button className={source.id === workspace.activeSourceId ? 'active' : ''} onClick={() => { setWorkspace((current) => ({ ...current, activeSourceId: source.id })); setMode('read'); setRailOpen(false) }} key={source.id}><i style={{ background: source.color }} /><span><strong>{source.title}</strong><small>{source.authors} · {source.year}</small></span></button>)}
      </section>
      <div className="rail-spacer" />
      <a className="relief-link" href="?app=relief"><span>↗</span><div><strong>Open Relief demo</strong><small>Disaster-response example</small></div></a>
      <footer><Database size={14} /><span>{workspace.evidence.length} evidence items</span><strong>v1</strong></footer>
    </aside>

    <main className="trace-main">
      <header className="trace-topbar">
        <button className="trace-mobile-menu" aria-label="Open navigation" onClick={() => setRailOpen(true)}><Menu size={19} /></button>
        <div className="trace-breadcrumb"><span>MELD / TRACE</span><ChevronRight size={13} /><strong>{recipe.label}</strong></div>
        <label className="trace-search"><Search size={15} /><input ref={searchRef} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search sources and evidence…" /><kbd>{window.meldDesktop?.platform === 'win32' ? 'Ctrl K' : '⌘ K'}</kbd></label>
        <div className="trace-top-actions"><span className="local-chip"><ShieldCheck size={14} /> Local data</span><button className="settings-button" title="AI provider settings" aria-label="AI provider settings" onClick={() => setSettingsOpen(true)}><Settings2 size={16} /></button>{undoShape && <button className="undo-shape-button" onClick={revertShape}><RotateCcw size={14} /> Undo shape</button>}<button className="inspector-toggle" title="Toggle inspector" aria-label="Toggle inspector" onClick={() => setInspectorOpen(!inspectorOpen)}>{inspectorOpen ? <PanelRightClose size={17} /> : <PanelRightOpen size={17} />}</button></div>
      </header>

      {shapeOpen && <ShapePopover workspace={workspace} mode={mode} settings={aiSettings} onOpenSettings={() => setSettingsOpen(true)} onApply={applyShape} onClose={() => setShapeOpen(false)} />}

      <div className="trace-canvas">
        <header className="trace-page-head"><div><p className="trace-eyebrow">{customization?.density ?? recipe.density} surface · {displayWorkspace.sources.length} sources</p><h1>{customization?.surfaceTitle ?? recipe.label}</h1><p>{recipe.description}</p></div><button onClick={() => setSourceModal(true)}><Plus size={15} /> Add source</button></header>
        {customization && <section className="shape-guidance"><div><Sparkles size={15} /><strong>Adaptive surface</strong><span>{customization.rationale}</span></div><ul>{customization.guidance.map((item) => <li key={item}>{item}</li>)}</ul><small>{displayWorkspace.evidence.length}/{workspace.evidence.length} evidence visible</small></section>}
        {mode === 'read' && <ReadView workspace={displayWorkspace} search={search} onSelect={(id) => setWorkspace((current) => ({ ...current, activeSourceId: id }))} onNotes={updateNotes} onDeleteEvidence={(id) => setWorkspace((current) => ({ ...current, evidence: current.evidence.filter((item) => item.id !== id) }))} onCapture={() => { if (!workspace.sources.length) setSourceModal(true); else { setMode('synthesize'); setInspectorOpen(true) } }} />}
        {mode === 'synthesize' && <SynthesisView workspace={displayWorkspace} search={search} onToggle={toggleEvidence} onCapture={() => setInspectorOpen(true)} />}
        {mode === 'brief' && <BriefView workspace={displayWorkspace} onChange={changeBrief} onToggle={toggleEvidence} onExport={() => exportWorkspace('markdown')} />}
      </div>
      <button className={`trace-composer ${shapeOpen ? 'active' : ''}`} onClick={() => setShapeOpen(!shapeOpen)} aria-label="Shape this workspace with AI">
        <span className="composer-orb"><Sparkles size={17} /></span>
        <span className="composer-copy"><strong>Shape this workspace</strong><small>Describe a task and preview a safe interface recipe</small></span>
        <span className={`composer-provider ${aiSettings?.hasApiKey ? 'ready' : ''}`}><i />{aiSettings?.hasApiKey ? aiSettings.model : 'Local'}</span>
        <kbd>{window.meldDesktop?.platform === 'win32' ? 'Ctrl I' : '⌘ I'}</kbd>
      </button>
    </main>

    {railOpen && <button className="trace-rail-scrim" aria-label="Close navigation" onClick={() => setRailOpen(false)} />}
    {inspectorOpen && <Inspector mode={mode} workspace={workspace} activeSource={activeSource} onClose={() => setInspectorOpen(false)} onAddEvidence={(item) => { setWorkspace((current) => addEvidence(current, item)); notify('Evidence captured and included in brief') }} onDeleteSource={(id) => { if (window.confirm('Remove this source and all evidence linked to it?')) { setWorkspace((current) => removeSource(current, id)); notify('Source removed') } }} onExport={exportWorkspace} onImport={() => importRef.current?.click()} onNew={() => { if (window.confirm('Start a blank workspace? Export a backup first if you need this data.')) { setWorkspace(createEmptyWorkspace()); setMode('read'); notify('Blank workspace created') } }} onRestore={() => { if (window.confirm('Replace this workspace with the original learning-science demo?')) { setWorkspace(cloneDemoWorkspace()); notify('Demo workspace restored') } }} />}
    <input ref={importRef} className="hidden-input" type="file" accept="application/json,.json" onChange={(event) => { const file = event.target.files?.[0]; if (file) importWorkspace(file); event.target.value = '' }} />
    {sourceModal && <SourceModal onClose={() => setSourceModal(false)} onSave={(source) => { setWorkspace((current) => addSource(current, source)); setSourceModal(false); setMode('read'); notify('Source added to your local workspace') }} />}
    {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} onSaved={setAISettings} />}
    {toast && <div className="trace-toast"><Check size={15} /> {toast}</div>}
  </div>
}
