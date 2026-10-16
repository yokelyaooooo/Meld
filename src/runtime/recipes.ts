import type { InterfaceRecipe, Role, UserContext } from './types'

const baseContext: UserContext = {
  role: 'resident',
  density: 'calm',
  connectivity: 'online',
  region: 'north',
  oneHanded: false,
  highContrast: false,
  language: 'en',
}

export const recipes: Record<Role, InterfaceRecipe> = {
  resident: {
    id: 'resident-safety',
    name: 'My safety plan',
    rationale: 'Prioritizes immediate safety, nearby verified places, and a small number of personal actions.',
    context: { ...baseContext, role: 'resident', density: 'calm' },
    navigation: ['overview', 'map'],
    updatedAt: 'just now',
    blocks: [
      { id: 'safety', type: 'safety-hero', title: 'Your area right now', capability: 'read_incidents', importance: 10, span: 3 },
      { id: 'shelters', type: 'nearby-shelters', title: 'Safe places nearby', capability: 'read_shelters', importance: 9, span: 2 },
      { id: 'checklist', type: 'personal-checklist', title: 'Before you leave', capability: 'read_resources', importance: 7, span: 1 },
      { id: 'activity', type: 'activity-feed', title: 'Verified updates', capability: 'read_incidents', importance: 5, span: 3 },
    ],
  },
  responder: {
    id: 'field-response',
    name: 'Field run',
    rationale: 'Compresses information into a one-handed, route-first flow that keeps working with a fragile connection.',
    context: { ...baseContext, role: 'responder', density: 'compact', connectivity: 'fragile', oneHanded: true },
    navigation: ['requests', 'map', 'people'],
    updatedAt: 'just now',
    blocks: [
      { id: 'route', type: 'field-route', title: 'Next three stops', capability: 'read_incidents', importance: 10, span: 2 },
      { id: 'report', type: 'quick-report', title: 'Log outcome', capability: 'update_request', importance: 9, span: 1 },
      { id: 'triage', type: 'triage-stack', title: 'Urgent queue', capability: 'read_incidents', importance: 8, span: 3 },
    ],
  },
  coordinator: {
    id: 'coordination-room',
    name: 'Coordination room',
    rationale: 'Expands the same shared data into a dense operational view with resource pressure and dispatch context.',
    context: { ...baseContext, role: 'coordinator', density: 'command', region: 'all' },
    navigation: ['overview', 'map', 'requests', 'people'],
    updatedAt: 'just now',
    blocks: [
      { id: 'metrics', type: 'metrics-strip', title: 'Operational pulse', capability: 'read_incidents', importance: 10, span: 3 },
      { id: 'map', type: 'situation-map', title: 'Live situation', capability: 'read_incidents', importance: 10, span: 2 },
      { id: 'resources', type: 'resource-board', title: 'Resource pressure', capability: 'read_resources', importance: 9, span: 1 },
      { id: 'triage', type: 'triage-stack', title: 'Dispatch queue', capability: 'dispatch_team', importance: 8, span: 2 },
      { id: 'activity', type: 'activity-feed', title: 'Network activity', capability: 'read_incidents', importance: 6, span: 1 },
    ],
  },
}

export function cloneRecipe(role: Role): InterfaceRecipe {
  return structuredClone(recipes[role])
}
