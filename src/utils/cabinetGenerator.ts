import {
  CabinetPart,
  CabinetSpec,
  COMPONENT_TYPE_META,
  EMPTY_EDGES,
  EMPTY_GROOVES,
} from '../types/cabinet';

let idCounter = 1000;
function nextPartId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}

/**
 * Generates standard frameless cabinet parts based on user-supplied dimensions,
 * component counts, carcass color, and front/door color.
 */
export function generateCabinetParts(spec: CabinetSpec): CabinetPart[] {
  const parts: CabinetPart[] = [];
  const t = Math.max(6, spec.boardThickness || 18);
  const label = spec.cabinetLabel.trim() || spec.cabinetType;
  const carcassColor = spec.carcassColor.trim() || 'Light Grey';
  const frontColor = spec.frontColor.trim() || carcassColor;

  const H = Math.max(100, spec.height);
  const W = Math.max(150, spec.width);
  const D = Math.max(120, spec.depth);

  const innerWidth = Math.max(50, Math.round((W - 2 * t) * 10) / 10);
  const innerHeight = Math.max(50, Math.round((H - 2 * t) * 10) / 10);

  // 1. Side Panels (2)
  parts.push({
    id: nextPartId('cab'),
    componentType: 'Side Panel',
    partName: `${label} Side Panel`,
    length: H,
    width: D,
    quantity: 2,
    color: carcassColor,
    rotationAllowed: false,
    grainDirection: 'Along Length',
    edgeSides: {...COMPONENT_TYPE_META['Side Panel'].defaultEdgeSides},
    grooveSides: {...COMPONENT_TYPE_META['Side Panel'].defaultGrooveSides},
    sourceCabinet: label,
  });

  // 2. Top Panel (1) & Bottom Panel (1)
  parts.push({
    id: nextPartId('cab'),
    componentType: 'Top/Bottom Panel',
    partName: `${label} Top Panel`,
    length: innerWidth,
    width: D,
    quantity: 1,
    color: carcassColor,
    rotationAllowed: true,
    grainDirection: 'None',
    edgeSides: {...COMPONENT_TYPE_META['Top/Bottom Panel'].defaultEdgeSides},
    grooveSides: {...EMPTY_GROOVES},
    sourceCabinet: label,
  });

  parts.push({
    id: nextPartId('cab'),
    componentType: 'Top/Bottom Panel',
    partName: `${label} Bottom Panel`,
    length: innerWidth,
    width: D,
    quantity: 1,
    color: carcassColor,
    rotationAllowed: true,
    grainDirection: 'None',
    edgeSides: {...COMPONENT_TYPE_META['Top/Bottom Panel'].defaultEdgeSides},
    grooveSides: {...EMPTY_GROOVES},
    sourceCabinet: label,
  });

  // 3. Back Panel (1)
  parts.push({
    id: nextPartId('cab'),
    componentType: 'Back Panel',
    partName: `${label} Back Panel`,
    length: innerHeight,
    width: innerWidth,
    quantity: 1,
    color: carcassColor,
    rotationAllowed: true,
    grainDirection: 'None',
    edgeSides: {...EMPTY_EDGES},
    grooveSides: {...EMPTY_GROOVES},
    sourceCabinet: label,
  });

  // 4. Shelves
  if (spec.shelves > 0) {
    const shelfDepth = Math.max(80, Math.round((D - 25) * 10) / 10);
    const shelfWidth = Math.max(50, Math.round((innerWidth - 2) * 10) / 10);
    parts.push({
      id: nextPartId('cab'),
      componentType: 'Shelf',
      partName: `${label} Adjustable Shelf`,
      length: shelfWidth,
      width: shelfDepth,
      quantity: spec.shelves,
      color: carcassColor,
      rotationAllowed: true,
      grainDirection: 'None',
      edgeSides: {...COMPONENT_TYPE_META.Shelf.defaultEdgeSides},
      grooveSides: {...EMPTY_GROOVES},
      sourceCabinet: label,
    });
  }

  // 5. Doors (use Front Color)
  const drawerBankHeight =
    spec.drawers > 0 && spec.doors > 0 ? Math.round(H * 0.25) : 0;

  if (spec.doors > 0) {
    const gap = 3;
    const doorHeight = Math.max(
      120,
      Math.round((H - drawerBankHeight - gap * (drawerBankHeight > 0 ? 2 : 1)) * 10) / 10
    );
    const totalGapW = gap * (spec.doors + 1);
    const doorWidth = Math.max(
      100,
      Math.round(((W - totalGapW) / spec.doors) * 10) / 10
    );
    parts.push({
      id: nextPartId('cab'),
      componentType: 'Door',
      partName: `${label} Door`,
      length: doorHeight,
      width: doorWidth,
      quantity: spec.doors,
      color: frontColor,
      rotationAllowed: false,
      grainDirection: 'Along Length',
      edgeSides: {...COMPONENT_TYPE_META.Door.defaultEdgeSides},
      grooveSides: {...EMPTY_GROOVES},
      sourceCabinet: label,
    });
  }

  // 6. Drawers (Fronts in Front Color, Boxes in Carcass Color)
  if (spec.drawers > 0) {
    const gap = 3;
    const availableDrawerH = spec.doors > 0 ? drawerBankHeight : H;
    const frontHeight = Math.max(
      80,
      Math.round(((availableDrawerH - gap * (spec.drawers + 1)) / spec.drawers) * 10) / 10
    );
    const frontWidth = Math.max(120, Math.round((W - gap * 2) * 10) / 10);

    const boxOuterWidth = Math.max(100, Math.round((innerWidth - 26) * 10) / 10);
    const boxDepth = Math.max(150, Math.round((D - 60) * 10) / 10);
    const boxSideHeight = Math.max(60, Math.min(180, Math.round(frontHeight * 0.72)));
    const boxInnerWidth = Math.max(60, Math.round((boxOuterWidth - 2 * t) * 10) / 10);

    parts.push({
      id: nextPartId('cab'),
      componentType: 'Drawer Front',
      partName: `${label} Drawer Front`,
      length: frontWidth,
      width: frontHeight,
      quantity: spec.drawers,
      color: frontColor,
      rotationAllowed: false,
      grainDirection: 'Along Length',
      edgeSides: {...COMPONENT_TYPE_META['Drawer Front'].defaultEdgeSides},
      grooveSides: {...EMPTY_GROOVES},
      sourceCabinet: label,
    });

    parts.push({
      id: nextPartId('cab'),
      componentType: 'Drawer Side',
      partName: `${label} Drawer Box Side`,
      length: boxDepth,
      width: boxSideHeight,
      quantity: spec.drawers * 2,
      color: carcassColor,
      rotationAllowed: true,
      grainDirection: 'None',
      edgeSides: {...COMPONENT_TYPE_META['Drawer Side'].defaultEdgeSides},
      grooveSides: {...EMPTY_GROOVES},
      sourceCabinet: label,
    });

    parts.push({
      id: nextPartId('cab'),
      componentType: 'Drawer Back',
      partName: `${label} Drawer Box Back & Sub-front`,
      length: boxInnerWidth,
      width: boxSideHeight,
      quantity: spec.drawers * 2,
      color: carcassColor,
      rotationAllowed: true,
      grainDirection: 'None',
      edgeSides: {...COMPONENT_TYPE_META['Drawer Back'].defaultEdgeSides},
      grooveSides: {...EMPTY_GROOVES},
      sourceCabinet: label,
    });

    parts.push({
      id: nextPartId('cab'),
      componentType: 'Drawer Bottom',
      partName: `${label} Drawer Box Bottom`,
      length: boxDepth,
      width: boxInnerWidth,
      quantity: spec.drawers,
      color: carcassColor,
      rotationAllowed: true,
      grainDirection: 'None',
      edgeSides: {...COMPONENT_TYPE_META['Drawer Bottom'].defaultEdgeSides},
      grooveSides: {...EMPTY_GROOVES},
      sourceCabinet: label,
    });
  }

  // 7. Toe Kick
  if (spec.includeToeKick && spec.toeKickHeight > 0) {
    parts.push({
      id: nextPartId('cab'),
      componentType: 'Toe Kick',
      partName: `${label} Front Toe Kick`,
      length: W,
      width: spec.toeKickHeight,
      quantity: 1,
      color: frontColor,
      rotationAllowed: true,
      grainDirection: 'None',
      edgeSides: {...COMPONENT_TYPE_META['Toe Kick'].defaultEdgeSides},
      grooveSides: {...EMPTY_GROOVES},
      sourceCabinet: label,
    });
  }

  return parts;
}
