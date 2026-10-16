import { useState } from 'react'
import {
  ArrowUpRight,
  BatteryCharging,
  Check,
  ChevronRight,
  CircleAlert,
  Clock3,
  Droplets,
  HeartPulse,
  MapPin,
  Navigation,
  PackageOpen,
  Radio,
  ShieldCheck,
  Truck,
  Users,
  Zap,
} from 'lucide-react'
import { incidents, resources, shelters, updates } from '../data/demo'
import type { BlockSpec, InterfaceRecipe } from '../runtime/types'

interface BlockProps {
  block: BlockSpec
  recipe: InterfaceRecipe
}

export function SafetyHero() {
  return (
    <section className="safety-hero block-enter">
      <div className="safety-signal"><span /><span /><span /></div>
      <div className="safety-copy">
        <p className="eyebrow">Northbank · verified 2 min ago</p>
        <h2>You’re outside the flood zone.</h2>
        <p>Stay indoors until 16:00. If you need to leave, use Juniper Road — the river path is closed.</p>
      </div>
      <button className="route-button">View safe route <ArrowUpRight size={18} /></button>
    </section>
  )
}

export function NearbyShelters() {
  return (
    <section className="paper-card block-enter">
      <header className="block-header">
        <div><p className="eyebrow">Live availability</p><h3>Safe places nearby</h3></div>
        <MapPin size={20} />
      </header>
      <div className="shelter-list">
        {shelters.slice(0, 2).map((shelter, index) => (
          <button className="shelter-row" key={shelter.name}>
            <span className="shelter-number">0{index + 1}</span>
            <span><strong>{shelter.name}</strong><small>{shelter.kind}</small></span>
            <span className="shelter-meta"><b>{shelter.distance}</b><small>{shelter.capacity} spaces</small></span>
            <ChevronRight size={17} />
          </button>
        ))}
      </div>
    </section>
  )
}

export function PersonalChecklist() {
  const [checked, setChecked] = useState([true, false, false])
  const items = ['Charge phone', 'Pack medication', 'Text your contact']
  return (
    <section className="paper-card checklist block-enter">
      <header className="block-header"><div><p className="eyebrow">3 calm steps</p><h3>Before you leave</h3></div><ShieldCheck size={20} /></header>
      {items.map((item, index) => (
        <button key={item} onClick={() => setChecked((value) => value.map((state, i) => i === index ? !state : state))} className={`check-row ${checked[index] ? 'done' : ''}`}>
          <span className="check-box">{checked[index] && <Check size={14} />}</span><span>{item}</span>
        </button>
      ))}
    </section>
  )
}

export function ActivityFeed({ compact = false }: { compact?: boolean }) {
  return (
    <section className={`paper-card activity-card block-enter ${compact ? 'compact' : ''}`}>
      <header className="block-header"><div><p className="eyebrow">Trusted network</p><h3>Verified updates</h3></div><Radio size={19} /></header>
      <div className="timeline">
        {updates.map((update) => (
          <div className="timeline-item" key={update.time}>
            <time>{update.time}</time><span className="timeline-dot" />
            <div><strong>{update.text}</strong><small>{update.source}</small></div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function FieldRoute() {
  const [active, setActive] = useState(0)
  return (
    <section className="route-card block-enter">
      <header className="route-head">
        <div><p className="eyebrow light">Optimized locally · 4.2 km</p><h3>North loop</h3></div>
        <div className="route-time"><strong>38</strong><small>min</small></div>
      </header>
      <div className="route-line" aria-hidden="true"><span /><span /><span /></div>
      <div className="route-stops">
        {incidents.slice(0, 3).map((incident, index) => (
          <button key={incident.id} className={active === index ? 'active' : ''} onClick={() => setActive(index)}>
            <span className="stop-index">{index + 1}</span>
            <span><small>{incident.id} · {incident.place}</small><strong>{incident.title}</strong></span>
            {active === index && <Navigation size={18} />}
          </button>
        ))}
      </div>
    </section>
  )
}

export function QuickReport() {
  const [selected, setSelected] = useState<string | null>(null)
  return (
    <section className="quick-card block-enter">
      <div><p className="eyebrow">Thumb zone</p><h3>Log outcome</h3><p>Saved offline if signal drops.</p></div>
      <div className="outcome-grid">
        {['Delivered', 'No answer', 'Need help', 'Unsafe'].map((item) => (
          <button key={item} className={selected === item ? 'selected' : ''} onClick={() => setSelected(item)}>{selected === item && <Check size={15} />}{item}</button>
        ))}
      </div>
      <button className="hold-button">Hold to save report</button>
    </section>
  )
}

export function TriageStack({ title = 'Urgent queue', coordinator = false }: { title?: string; coordinator?: boolean }) {
  const [resolved, setResolved] = useState<string[]>([])
  return (
    <section className={`paper-card triage-card block-enter ${coordinator ? 'wide-triage' : ''}`}>
      <header className="block-header"><div><p className="eyebrow">Ranked by risk + time</p><h3>{title}</h3></div><span className="count-badge">{incidents.length - resolved.length} open</span></header>
      <div className="triage-list">
        {incidents.map((incident) => (
          <article className={`triage-row ${resolved.includes(incident.id) ? 'resolved' : ''}`} key={incident.id}>
            <span className={`severity ${incident.level}`} />
            <span className="request-id">{incident.id}</span>
            <div className="request-copy"><strong>{incident.title}</strong><small><MapPin size={12} /> {incident.place}</small></div>
            <span className="request-age"><Clock3 size={13} /> {incident.age}</span>
            {coordinator ? <button onClick={() => setResolved((items) => [...items, incident.id])}>Dispatch</button> : <ChevronRight size={18} />}
          </article>
        ))}
      </div>
    </section>
  )
}

export function SituationMap() {
  return (
    <section className="map-card block-enter">
      <header className="map-head"><div><p className="eyebrow light">12 sources · live</p><h3>Situation map</h3></div><div className="map-legend"><span className="critical-dot" /> Needs <span className="safe-dot" /> Safe sites</div></header>
      <div className="map-canvas" aria-label="Stylized live situation map">
        <div className="river" /><div className="road road-a" /><div className="road road-b" /><div className="road road-c" />
        <span className="map-label label-north">NORTHBANK</span><span className="map-label label-river">RIVERSIDE</span>
        <div className="map-marker danger m1"><HeartPulse size={15} /><small>4 urgent</small></div>
        <div className="map-marker safe m2"><ShieldCheck size={15} /><small>42 spaces</small></div>
        <div className="map-marker team m3"><Truck size={15} /><small>Cedar</small></div>
        <div className="pulse-ring p1" /><div className="pulse-ring p2" />
      </div>
    </section>
  )
}

export function MetricsStrip() {
  const metrics = [
    { label: 'Open requests', value: '27', delta: '−6 this hour', icon: CircleAlert },
    { label: 'People sheltered', value: '184', delta: '+31 today', icon: Users },
    { label: 'Field teams', value: '9', delta: '7 active', icon: Truck },
    { label: 'Median response', value: '18m', delta: '↓ 4 minutes', icon: Zap },
  ]
  return (
    <section className="metrics-strip block-enter">
      {metrics.map((metric) => <article key={metric.label}><metric.icon size={17} /><span><small>{metric.label}</small><strong>{metric.value}</strong><em>{metric.delta}</em></span></article>)}
    </section>
  )
}

export function ResourceBoard() {
  const icons = [Droplets, HeartPulse, Truck, BatteryCharging]
  return (
    <section className="paper-card resource-card block-enter">
      <header className="block-header"><div><p className="eyebrow">Across 3 hubs</p><h3>Resource pressure</h3></div><PackageOpen size={19} /></header>
      {resources.map((resource, index) => {
        const Icon = icons[index]
        const pct = Math.round(resource.current / resource.target * 100)
        return <div className="resource-row" key={resource.label}><Icon size={16} /><div><span><strong>{resource.label}</strong><small>{resource.current}/{resource.target} {resource.unit}</small></span><div className="meter"><i className={resource.tone} style={{ width: `${Math.min(pct, 100)}%` }} /></div></div></div>
      })}
    </section>
  )
}

export function Block({ block, recipe }: BlockProps) {
  const coordinator = recipe.context.role === 'coordinator'
  switch (block.type) {
    case 'safety-hero': return <SafetyHero />
    case 'nearby-shelters': return <NearbyShelters />
    case 'personal-checklist': return <PersonalChecklist />
    case 'activity-feed': return <ActivityFeed compact={coordinator} />
    case 'field-route': return <FieldRoute />
    case 'quick-report': return <QuickReport />
    case 'triage-stack': return <TriageStack title={block.title} coordinator={coordinator} />
    case 'situation-map': return <SituationMap />
    case 'metrics-strip': return <MetricsStrip />
    case 'resource-board': return <ResourceBoard />
    default: return null
  }
}
