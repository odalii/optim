import {CabinetPart, CabinetSpec, MaterialSettings, ProjectInfo} from '../types/cabinet';

export interface ColorSwatch {
  name: string;
  hex: string;
}

export const BOARD_COLOR_PRESETS: ColorSwatch[] = [
  {name: 'Light Grey', hex: '#CBD5E1'},
  {name: 'White', hex: '#F8FAFC'},
  {name: 'Summer Oak', hex: '#D6A874'},
  {name: 'Natural Birch', hex: '#E5CBA5'},
  {name: 'Warm Walnut', hex: '#7C5438'},
  {name: 'Cashmere', hex: '#D6CEC2'},
  {name: 'Anthracite', hex: '#374151'},
  {name: 'Matte Black', hex: '#1E293B'},
  {name: 'Sage Green', hex: '#94A89A'},
  {name: 'Navy Blue', hex: '#334E68'},
];

export function resolveColorHex(colorName: string): string {
  const normalized = colorName.trim().toLowerCase();
  const match = BOARD_COLOR_PRESETS.find((c) => c.name.toLowerCase() === normalized);
  if (match) return match.hex;
  if (normalized.includes('oak')) return '#D6A874';
  if (normalized.includes('walnut')) return '#7C5438';
  if (normalized.includes('birch') || normalized.includes('ply')) return '#E5CBA5';
  if (normalized.includes('grey') || normalized.includes('gray')) return '#CBD5E1';
  if (normalized.includes('white')) return '#F8FAFC';
  if (normalized.includes('black')) return '#1E293B';
  if (normalized.includes('green') || normalized.includes('sage')) return '#94A89A';
  if (normalized.includes('blue') || normalized.includes('navy')) return '#334E68';
  return '#CBD5E1';
}

export const MATERIAL_PRESETS: Array<Omit<MaterialSettings, 'kerf' | 'trimMargin'>> = [
  {
    materialName: '18mm Birch Plywood',
    defaultColor: 'Natural Birch',
    sheetLength: 2440,
    sheetWidth: 1220,
    thickness: 18,
  },
  {
    materialName: '18mm White Melamine MDF',
    defaultColor: 'White',
    sheetLength: 2440,
    sheetWidth: 1220,
    thickness: 18,
  },
  {
    materialName: '18mm Light Grey Melamine',
    defaultColor: 'Light Grey',
    sheetLength: 2440,
    sheetWidth: 1220,
    thickness: 18,
  },
  {
    materialName: '18mm Summer Oak Chipboard',
    defaultColor: 'Summer Oak',
    sheetLength: 2440,
    sheetWidth: 1220,
    thickness: 18,
  },
  {
    materialName: '16mm Egger Eurodekor Chipboard',
    defaultColor: 'Light Grey',
    sheetLength: 2800,
    sheetWidth: 2070,
    thickness: 16,
  },
];

export const DEFAULT_PROJECT_INFO: ProjectInfo = {
  projectName: 'Kitchen Base & Storage Run',
  clientName: 'Northside Joinery Workshop',
  jobReference: 'JOB-2026-041',
  notes: 'Metric dimensions in mm. Standard 32mm frameless carcass construction with 3.2mm saw kerf.',
};

export const DEFAULT_MATERIAL_SETTINGS: MaterialSettings = {
  materialName: '18mm Plywood',
  defaultColor: 'Light Grey',
  sheetLength: 2440,
  sheetWidth: 1220,
  thickness: 18,
  kerf: 3.2,
  trimMargin: 5,
};

export const INITIAL_PARTS: CabinetPart[] = [
  {
    id: 'part-1',
    componentType: 'Side Panel',
    partName: 'Carcass Side Panel',
    length: 720,
    width: 560,
    quantity: 4,
    color: 'Light Grey',
    rotationAllowed: false,
    grainDirection: 'Along Length',
    edgeSides: {e1: true, e2: false, e3: false, e4: false},
    grooveSides: {g1: false, g2: false, g3: true, g4: false},
  },
  {
    id: 'part-2',
    componentType: 'Shelf',
    partName: 'Adjustable Interior Shelf',
    length: 560,
    width: 500,
    quantity: 6,
    color: 'Light Grey',
    rotationAllowed: true,
    grainDirection: 'None',
    edgeSides: {e1: true, e2: false, e3: false, e4: false},
    grooveSides: {g1: false, g2: false, g3: false, g4: false},
  },
  {
    id: 'part-3',
    componentType: 'Door',
    partName: 'Flush Cabinet Door',
    length: 700,
    width: 350,
    quantity: 4,
    color: 'Summer Oak',
    rotationAllowed: false,
    grainDirection: 'Along Length',
    edgeSides: {e1: true, e2: true, e3: true, e4: true},
    grooveSides: {g1: false, g2: false, g3: false, g4: false},
  },
  {
    id: 'part-4',
    componentType: 'Back Panel',
    partName: 'Carcass Back Panel',
    length: 720,
    width: 700,
    quantity: 2,
    color: 'Light Grey',
    rotationAllowed: true,
    grainDirection: 'None',
    edgeSides: {e1: false, e2: false, e3: false, e4: false},
    grooveSides: {g1: false, g2: false, g3: false, g4: false},
  },
  {
    id: 'part-5',
    componentType: 'Blanking Panel',
    partName: 'Service Void Blanking',
    length: 100,
    width: 720,
    quantity: 2,
    color: 'Summer Oak',
    rotationAllowed: true,
    grainDirection: 'None',
    edgeSides: {e1: true, e2: false, e3: false, e4: false},
    grooveSides: {g1: false, g2: false, g3: false, g4: false},
  },
];

export const CABINET_TYPE_DEFAULTS: Record<
  CabinetSpec['cabinetType'],
  Omit<CabinetSpec, 'cabinetLabel' | 'boardThickness' | 'carcassColor' | 'frontColor'>
> = {
  'Base Cabinet': {
    cabinetType: 'Base Cabinet',
    height: 720,
    width: 800,
    depth: 560,
    shelves: 1,
    doors: 2,
    drawers: 0,
    includeToeKick: true,
    toeKickHeight: 100,
  },
  'Wall Cabinet': {
    cabinetType: 'Wall Cabinet',
    height: 720,
    width: 800,
    depth: 320,
    shelves: 2,
    doors: 2,
    drawers: 0,
    includeToeKick: false,
    toeKickHeight: 0,
  },
  'Tall Cabinet': {
    cabinetType: 'Tall Cabinet',
    height: 2100,
    width: 600,
    depth: 580,
    shelves: 4,
    doors: 2,
    drawers: 0,
    includeToeKick: true,
    toeKickHeight: 100,
  },
  Wardrobe: {
    cabinetType: 'Wardrobe',
    height: 2200,
    width: 1000,
    depth: 600,
    shelves: 3,
    doors: 2,
    drawers: 2,
    includeToeKick: true,
    toeKickHeight: 80,
  },
  'Drawer Unit': {
    cabinetType: 'Drawer Unit',
    height: 720,
    width: 600,
    depth: 560,
    shelves: 0,
    doors: 0,
    drawers: 4,
    includeToeKick: true,
    toeKickHeight: 100,
  },
  'Custom Cabinet': {
    cabinetType: 'Custom Cabinet',
    height: 900,
    width: 750,
    depth: 500,
    shelves: 2,
    doors: 2,
    drawers: 1,
    includeToeKick: false,
    toeKickHeight: 0,
  },
};
