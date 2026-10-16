import type { Capability } from './types'

export const capabilities: Capability[] = [
  { id: 'read_incidents', label: 'Read incident reports', risk: 'read', allowedRoles: ['resident', 'responder', 'coordinator'] },
  { id: 'read_resources', label: 'Read resource inventory', risk: 'read', allowedRoles: ['resident', 'responder', 'coordinator'] },
  { id: 'read_shelters', label: 'Read shelter status', risk: 'read', allowedRoles: ['resident', 'responder', 'coordinator'] },
  { id: 'update_request', label: 'Update a help request', risk: 'write', allowedRoles: ['responder', 'coordinator'] },
  { id: 'dispatch_team', label: 'Dispatch a response team', risk: 'critical', allowedRoles: ['coordinator'] },
  { id: 'broadcast_alert', label: 'Broadcast a public alert', risk: 'critical', allowedRoles: ['coordinator'] },
]

export const appManifest = {
  id: 'org.meld.relief',
  name: 'Relief',
  version: '0.1.0',
  description: 'A local-first coordination surface for community emergency response.',
  agent: {
    canCompose: true,
    canReorder: true,
    canChangeDensity: true,
    cannotBypassPermissions: true,
    cannotInventCapabilities: true,
  },
  capabilities,
} as const
