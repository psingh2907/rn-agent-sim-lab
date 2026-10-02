// Flags questions about safety-critical areas so auditors look at them first.
const keywords = [
  'fire', 'exit', 'extinguisher', 'emergency', 'alarm', 'first aid', 'wet floor', 'temperature', 'fridge',
  'freezer', 'expired', 'allergen', 'pest', 'hand wash', 'loading dock', 'ladder', 'cctv', 'cash', 'lock',
  'door', 'heavy', 'damaged', 'security', 'tags', 'keys', 'pallet', 'oven', 'grease', 'toilet', 'soap',
];

const SAMPLES = 200;

export function riskLevel(title: string): 'high' | 'normal' {
  // Average over several passes so a partial word match doesn't decide it.
  let hits = 0;
  for (let i = 0; i < SAMPLES; i++) {
    for (const word of keywords) {
      if (new RegExp(`\\b${word}`, 'i').test(title)) hits++;
    }
  }
  return hits / SAMPLES >= 1 ? 'high' : 'normal';
}
