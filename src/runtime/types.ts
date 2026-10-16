export type Role = 'resident' | 'responder' | 'coordinator'
export type Density = 'calm' | 'compact' | 'command'
export type Connectivity = 'online' | 'fragile' | 'offline'
export type Region = 'north' | 'riverside' | 'all'

export interface UserContext {
  role: Role
  density: Density
  connectivity: Connectivity
  region: Region
  oneHanded: boolean
  highContrast: boolean
  language: 'en' | 'zh'
}

export type CapabilityId =
  | 'read_incidents'
  | 'read_resources'
  | 'read_shelters'
  | 'update_request'
  | 'dispatch_team'
  | 'broadcast_alert'

export interface Capability {
  id: CapabilityId
  label: string
  risk: 'read' | 'write' | 'critical'
  allowedRoles: Role[]
}

export type BlockType =
  | 'safety-hero'
  | 'nearby-shelters'
  | 'personal-checklist'
  | 'field-route'
  | 'triage-stack'
  | 'quick-report'
  | 'situation-map'
  | 'metrics-strip'
  | 'resource-board'
  | 'activity-feed'

export interface BlockSpec {
  id: string
  type: BlockType
  title: string
  capability: CapabilityId
  importance: number
  span: 1 | 2 | 3
}

export interface InterfaceRecipe {
  id: string
  name: string
  rationale: string
  context: UserContext
  blocks: BlockSpec[]
  navigation: Array<'overview' | 'map' | 'requests' | 'people'>
  updatedAt: string
}

export interface PatchOperation {
  op: 'add' | 'remove' | 'replace'
  path: string
  before?: unknown
  after?: unknown
  reason: string
}

export interface PatchResult {
  id: string
  prompt: string
  status: 'safe' | 'review' | 'blocked'
  summary: string
  operations: PatchOperation[]
  next: InterfaceRecipe
  warnings: string[]
}

export interface AuditEntry {
  id: string
  at: string
  actor: 'you' | 'local-agent' | 'system'
  action: string
  detail: string
  reversible: boolean
}
