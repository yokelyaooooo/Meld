import { Activity, Boxes, CloudOff, GitFork, History, House, Map, Radio, Settings2, Shield, UsersRound } from 'lucide-react'
import type { Connectivity, Role } from '../runtime/types'

interface SidebarProps {
  role: Role
  connectivity: Connectivity
  onRoleChange: (role: Role) => void
  onConnectivityChange: (value: Connectivity) => void
}

const roles: Array<{ id: Role; label: string; short: string }> = [
  { id: 'resident', label: 'Resident', short: 'RS' },
  { id: 'responder', label: 'Field crew', short: 'FC' },
  { id: 'coordinator', label: 'Coordinator', short: 'CO' },
]

export function Sidebar({ role, connectivity, onRoleChange, onConnectivityChange }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark"><i /><i /><i /></span><div><strong>Meld</strong><small>/ Relief</small></div></div>
      <nav className="primary-nav" aria-label="Primary navigation">
        <button className="active"><House size={19} /><span>Live view</span></button>
        <button><Map size={19} /><span>Map</span></button>
        <button><Radio size={19} /><span>Requests</span><b>27</b></button>
        <button><UsersRound size={19} /><span>People</span></button>
        <button><Boxes size={19} /><span>Resources</span></button>
      </nav>
      <div className="sidebar-rule" />
      <div className="mode-switcher">
        <p>INTERFACE FOR</p>
        {roles.map((item) => <button key={item.id} onClick={() => onRoleChange(item.id)} className={role === item.id ? 'selected' : ''}><span>{item.short}</span><strong>{item.label}</strong>{role === item.id && <i />}</button>)}
      </div>
      <div className="sidebar-spacer" />
      <div className="sync-card">
        <div><span className={connectivity}><Activity size={14} /></span><strong>{connectivity === 'online' ? 'Mesh online' : connectivity === 'fragile' ? 'Signal fragile' : 'Working offline'}</strong></div>
        <p>{connectivity === 'online' ? '12 peers · synced now' : 'Changes queue locally'}</p>
        <button onClick={() => onConnectivityChange(connectivity === 'online' ? 'offline' : 'online')}><CloudOff size={14} /> Toggle offline demo</button>
      </div>
      <footer className="side-footer"><button aria-label="History"><History size={18} /></button><button aria-label="Policy"><Shield size={18} /></button><button aria-label="Settings"><Settings2 size={18} /></button><button aria-label="Repository"><GitFork size={18} /></button></footer>
    </aside>
  )
}
