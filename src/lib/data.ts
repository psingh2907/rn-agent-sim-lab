export type ChecklistItem =
  | { id: string; kind: 'header'; title: string }
  | { id: string; kind: 'question'; title: string; answer?: 'yes' | 'no' }
  | { id: string; kind: 'photo'; title: string; uri: string };

// A store audit: sections of yes/no questions with photo evidence, long
// enough that the list scrolls well past one screen.
const sections: [string, string[]][] = [
  ['Safety', ['Fire exit clear of obstructions', 'Fire extinguishers inspected', 'First aid kit stocked', 'Wet floor signs available', 'Emergency lighting working', 'Exit signs lit']],
  ['Food safety', ['Fridge temperatures logged', 'Freezer temperatures logged', 'No expired stock on shelves', 'Allergen labels present', 'Hand wash station stocked', 'Pest control log up to date']],
  ['Cleaning', ['Floors clean', 'Are the customer toilets cleaned, restocked with soap and paper towels, and signed off on the cleaning rota at least every two hours during opening?', 'Bins emptied', 'Is the area behind the bakery ovens and under the proofing cabinets free of flour build-up, crumbs and grease?', 'Trolley bay tidy', 'Entrance mats clean']],
  ['Shelves', ['Price labels on every product', 'Promotions match the planogram', 'No gaps on top sellers', 'Shelf edges clean', 'Heavy items on low shelves', 'Damaged stock removed']],
  ['Checkouts', ['All scanners working', 'Card terminals working', 'Bags stocked', 'Queue barriers in place', 'Self-checkout attendant present', 'Cash office locked']],
  ['Staff', ['Name badges worn', 'Rota posted', 'Training records up to date', 'Break room clean', 'Lockers secure', 'Uniforms clean']],
  ['Stockroom', ['Loading dock door closes fully', 'Stock rotated first in, first out', 'Aisles clear for pallet trucks', 'Cardboard baled', 'Ladders inspected', 'Delivery paperwork filed']],
  ['Security', ['CCTV cameras recording', 'Alarm tested this week', 'Tags on high-value items', 'Key log signed', 'Fire doors closed', 'Lost property logged']],
];

export const checklist: ChecklistItem[] = sections.flatMap(([section, questions], s) => [
  { id: `h${s}`, kind: 'header' as const, title: section },
  ...questions.map((title, q) => ({ id: `q${s}-${q}`, kind: 'question' as const, title })),
  {
    id: `p${s}`,
    kind: 'photo' as const,
    title: `${section} photo evidence`,
    uri: `https://picsum.photos/seed/${s}/600/400`,
  },
]);
