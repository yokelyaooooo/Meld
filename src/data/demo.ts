export const shelters = [
  { name: 'North Library', distance: '6 min walk', status: 'Open', capacity: 42, kind: 'Power · Water · First aid' },
  { name: 'Juniper School', distance: '14 min walk', status: 'Open', capacity: 18, kind: 'Pets welcome · Meals' },
  { name: 'Riverside Hall', distance: '1.8 km', status: 'Limited', capacity: 7, kind: 'Medical support' },
]

export const incidents = [
  { id: 'R-184', level: 'critical', title: 'Insulin needs refrigeration', place: 'Marrow St · 0.8 km', age: '4m', people: 1 },
  { id: 'R-179', level: 'high', title: 'Two residents need transport', place: 'Canal Walk · 1.2 km', age: '11m', people: 2 },
  { id: 'R-171', level: 'medium', title: 'Drinking water requested', place: 'Northbank · 1.6 km', age: '18m', people: 4 },
  { id: 'R-168', level: 'medium', title: 'Debris blocking side street', place: 'Pine & 7th · 2.1 km', age: '24m', people: 0 },
]

export const updates = [
  { time: '14:32', text: 'North Library shelter verified open', source: 'Nora · site lead' },
  { time: '14:28', text: 'Water level stable at East gauge', source: 'River sensor 04' },
  { time: '14:19', text: 'Juniper route cleared for foot traffic', source: 'Field team Cedar' },
]

export const resources = [
  { label: 'Water', current: 68, target: 80, unit: 'cases', tone: 'cyan' },
  { label: 'Medical', current: 14, target: 32, unit: 'kits', tone: 'orange' },
  { label: 'Drivers', current: 9, target: 12, unit: 'active', tone: 'green' },
  { label: 'Power', current: 4, target: 9, unit: 'stations', tone: 'yellow' },
]
