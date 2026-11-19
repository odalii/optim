export const COMPONENT_TYPES = [
  'Top/Bottom Panel',
  'Side Panel',
  'Shelf',
  'Back Panel',
  'Door',
  'Drawer Front',
  'Drawer Side',
  'Drawer Back',
  'Drawer Bottom',
  'Toe Kick',
  'Blanking Panel',
  'Filler',
  'End Panel',
  'Custom Piece',
] as const;

export type ComponentType = (typeof COMPONENT_TYPES)[number];

export type GrainDirection = 'None' | 'Along Length' | 'Along Width';

export interface EdgeSides {
  e1: boolean;
  e2: boolean;
  e3: boolean;
  e4: boolean;
}

export interface GrooveSides {
  g1: boolean;
  g2: boolean;
  g3: boolean;
  g4: boolean;
}

export interface ComponentTypeMeta {
  type: ComponentType;
  plural: string;
  shortCode: string;
  cadFill: string;
  cadStroke: string;
  cadText: string;
  defaultRotation: boolean;
  defaultGrain: GrainDirection;
  defaultEdgeSides: EdgeSides;
  defaultGrooveSides: GrooveSides;
}

export const EMPTY_EDGES: EdgeSides = {e1: false, e2: false, e3: false, e4: false};
export const EMPTY_GROOVES: GrooveSides = {g1: false, g2: false, g3: false, g4: false};

export const COMPONENT_TYPE_META: Record<ComponentType, ComponentTypeMeta> = {
  'Top/Bottom Panel': {
    type: 'Top/Bottom Panel',
    plural: 'Top/Bottom Panels',
    shortCode: 'TB',
    cadFill: '#E2E8F0',
    cadStroke: '#64748B',
    cadText: '#0F172A',
    defaultRotation: true,
    defaultGrain: 'None',
    defaultEdgeSides: {e1: true, e2: false, e3: false, e4: false},
    defaultGrooveSides: {g1: false, g2: false, g3: false, g4: false},
  },
  'Side Panel': {
    type: 'Side Panel',
    plural: 'Side Panels',
    shortCode: 'SP',
    cadFill: '#DBEAFE',
    cadStroke: '#2563EB',
    cadText: '#1E3A8A',
    defaultRotation: false,
    defaultGrain: 'Along Length',
    defaultEdgeSides: {e1: true, e2: false, e3: false, e4: false},
    defaultGrooveSides: {g1: false, g2: false, g3: true, g4: false},
  },
  Shelf: {
    type: 'Shelf',
    plural: 'Shelves',
    shortCode: 'SH',
    cadFill: '#E0F2FE',
    cadStroke: '#0284C7',
    cadText: '#0C4A6E',
    defaultRotation: true,
    defaultGrain: 'None',
    defaultEdgeSides: {e1: true, e2: false, e3: false, e4: false},
    defaultGrooveSides: {g1: false, g2: false, g3: false, g4: false},
  },
  'Back Panel': {
    type: 'Back Panel',
    plural: 'Back Panels',
    shortCode: 'BP',
    cadFill: '#F1F5F9',
    cadStroke: '#94A3B8',
    cadText: '#334155',
    defaultRotation: true,
    defaultGrain: 'None',
    defaultEdgeSides: {e1: false, e2: false, e3: false, e4: false},
    defaultGrooveSides: {g1: false, g2: false, g3: false, g4: false},
  },
  Door: {
    type: 'Door',
    plural: 'Doors',
    shortCode: 'DR',
    cadFill: '#FEF3C7',
    cadStroke: '#D97706',
    cadText: '#78350F',
    defaultRotation: false,
    defaultGrain: 'Along Length',
    defaultEdgeSides: {e1: true, e2: true, e3: true, e4: true},
    defaultGrooveSides: {g1: false, g2: false, g3: false, g4: false},
  },
  'Drawer Front': {
    type: 'Drawer Front',
    plural: 'Drawer Fronts',
    shortCode: 'DF',
    cadFill: '#FFEDD5',
    cadStroke: '#EA580C',
    cadText: '#7C2D12',
    defaultRotation: false,
    defaultGrain: 'Along Width',
    defaultEdgeSides: {e1: true, e2: true, e3: true, e4: true},
    defaultGrooveSides: {g1: false, g2: false, g3: false, g4: false},
  },
  'Drawer Side': {
    type: 'Drawer Side',
    plural: 'Drawer Sides',
    shortCode: 'DS',
    cadFill: '#ECFDF5',
    cadStroke: '#059669',
    cadText: '#064E3B',
    defaultRotation: true,
    defaultGrain: 'None',
    defaultEdgeSides: {e1: false, e2: true, e3: false, e4: false},
    defaultGrooveSides: {g1: false, g2: false, g3: false, g4: false},
  },
  'Drawer Back': {
    type: 'Drawer Back',
    plural: 'Drawer Backs',
    shortCode: 'DK',
    cadFill: '#F0FDF4',
    cadStroke: '#16A34A',
    cadText: '#14532D',
    defaultRotation: true,
    defaultGrain: 'None',
    defaultEdgeSides: {e1: false, e2: true, e3: false, e4: false},
    defaultGrooveSides: {g1: false, g2: false, g3: false, g4: false},
  },
  'Drawer Bottom': {
    type: 'Drawer Bottom',
    plural: 'Drawer Bottoms',
    shortCode: 'DB',
    cadFill: '#F8FAFC',
    cadStroke: '#64748B',
    cadText: '#334155',
    defaultRotation: true,
    defaultGrain: 'None',
    defaultEdgeSides: {e1: false, e2: true, e3: false, e4: false},
    defaultGrooveSides: {g1: false, g2: false, g3: false, g4: false},
  },
  'Toe Kick': {
    type: 'Toe Kick',
    plural: 'Toe Kicks',
    shortCode: 'TK',
    cadFill: '#E2E8F0',
    cadStroke: '#475569',
    cadText: '#0F172A',
    defaultRotation: true,
    defaultGrain: 'None',
    defaultEdgeSides: {e1: true, e2: false, e3: false, e4: false},
    defaultGrooveSides: {g1: false, g2: false, g3: false, g4: false},
  },
  'Blanking Panel': {
    type: 'Blanking Panel',
    plural: 'Blanking Panels',
    shortCode: 'BL',
    cadFill: '#EDE9FE',
    cadStroke: '#7C3AED',
    cadText: '#4C1D95',
    defaultRotation: true,
    defaultGrain: 'None',
    defaultEdgeSides: {e1: true, e2: false, e3: false, e4: false},
    defaultGrooveSides: {g1: false, g2: false, g3: false, g4: false},
  },
  Filler: {
    type: 'Filler',
    plural: 'Fillers',
    shortCode: 'FL',
    cadFill: '#FCE7F3',
    cadStroke: '#DB2777',
    cadText: '#831843',
    defaultRotation: false,
    defaultGrain: 'Along Length',
    defaultEdgeSides: {e1: true, e2: false, e3: false, e4: false},
    defaultGrooveSides: {g1: false, g2: false, g3: false, g4: false},
  },
  'End Panel': {
    type: 'End Panel',
    plural: 'End Panels',
    shortCode: 'EP',
    cadFill: '#CCFBF1',
    cadStroke: '#0D9488',
    cadText: '#134E4A',
    defaultRotation: false,
    defaultGrain: 'Along Length',
    defaultEdgeSides: {e1: true, e2: true, e3: true, e4: true},
    defaultGrooveSides: {g1: false, g2: false, g3: false, g4: false},
  },
  'Custom Piece': {
    type: 'Custom Piece',
    plural: 'Custom Pieces',
    shortCode: 'CP',
    cadFill: '#F3F4F6',
    cadStroke: '#4B5563',
    cadText: '#111827',
    defaultRotation: true,
    defaultGrain: 'None',
    defaultEdgeSides: {e1: false, e2: false, e3: false, e4: false},
    defaultGrooveSides: {g1: false, g2: false, g3: false, g4: false},
  },
};

export interface ProjectInfo {
  projectName: string;
  clientName: string;
  jobReference: string;
  notes: string;
}

export interface MaterialSettings {
  materialName: string;
  defaultColor: string;
  sheetLength: number;
  sheetWidth: number;
  thickness: number;
  kerf: number;
  trimMargin: number;
}

export interface CabinetPart {
  id: string;
  componentType: ComponentType;
  partName: string;
  length: number;
  width: number;
  quantity: number;
  color: string;
  rotationAllowed: boolean;
  grainDirection: GrainDirection;
  edgeSides: EdgeSides;
  grooveSides: GrooveSides;
  sourceCabinet?: string;
}

export const CABINET_TYPES = [
  'Base Cabinet',
  'Wall Cabinet',
  'Tall Cabinet',
  'Wardrobe',
  'Drawer Unit',
  'Custom Cabinet',
] as const;

export type CabinetType = (typeof CABINET_TYPES)[number];

export interface CabinetSpec {
  cabinetType: CabinetType;
  cabinetLabel: string;
  height: number;
  width: number;
  depth: number;
  shelves: number;
  doors: number;
  drawers: number;
  boardThickness: number;
  carcassColor: string;
  frontColor: string;
  includeToeKick: boolean;
  toeKickHeight: number;
}

export interface PlacedPart {
  instanceId: string;
  partId: string;
  componentType: ComponentType;
  partName: string;
  color: string;
  x: number;
  y: number;
  placedLength: number;
  placedWidth: number;
  originalLength: number;
  originalWidth: number;
  rotated: boolean;
  grainDirection: GrainDirection;
}

export interface OffcutRect {
  id: string;
  boardNumber: number;
  boardColor: string;
  x: number;
  y: number;
  length: number;
  width: number;
  areaMm2: number;
  areaM2: number;
}

export interface ComponentGroupSummary {
  componentType: ComponentType;
  count: number;
  totalAreaM2: number;
  parts: PlacedPart[];
}

export interface BoardResult {
  boardNumber: number;
  boardColor: string;
  sheetLength: number;
  sheetWidth: number;
  placedParts: PlacedPart[];
  componentGroups: ComponentGroupSummary[];
  offcuts: OffcutRect[];
  usedAreaMm2: number;
  offcutAreaMm2: number;
  utilizationPercent: number;
}

export interface ColorBoardSummary {
  color: string;
  boards: number;
  pieces: number;
  utilizationPercent: number;
}

export interface OversizedPartError {
  partId: string;
  partName: string;
  componentType: ComponentType;
  color: string;
  length: number;
  width: number;
  reason: string;
}

export interface OptimizationResult {
  boards: BoardResult[];
  colorSummaries: ColorBoardSummary[];
  allOffcuts: OffcutRect[];
  oversizedParts: OversizedPartError[];
  totalBoards: number;
  totalPiecesPlaced: number;
  totalSheetAreaM2: number;
  totalUsedAreaM2: number;
  totalOffcutAreaM2: number;
  overallUtilizationPercent: number;
  generatedAt: string;
}
