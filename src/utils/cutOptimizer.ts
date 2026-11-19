import {
  BoardResult,
  CabinetPart,
  ColorBoardSummary,
  COMPONENT_TYPES,
  ComponentGroupSummary,
  ComponentType,
  MaterialSettings,
  OffcutRect,
  OptimizationResult,
  OversizedPartError,
  PlacedPart,
} from '../types/cabinet';

interface FreeRect {
  x: number;
  y: number;
  length: number; // along sheet X (sheetLength)
  width: number;  // along sheet Y (sheetWidth)
}

interface ExpandedPiece {
  instanceId: string;
  partId: string;
  componentType: ComponentType;
  partName: string;
  color: string;
  length: number;
  width: number;
  rotationAllowed: boolean;
  grainDirection: CabinetPart['grainDirection'];
}

interface BoardBin {
  boardNumber: number;
  boardColor: string;
  freeRects: FreeRect[];
  placedParts: PlacedPart[];
}

function round1(val: number): number {
  return Math.round(val * 10) / 10;
}

function canPlaceNormal(part: ExpandedPiece): boolean {
  if (part.grainDirection === 'Along Width') {
    return false;
  }
  return true;
}

function canPlaceRotated(part: ExpandedPiece): boolean {
  if (part.grainDirection === 'Along Length') {
    return false;
  }
  if (part.grainDirection === 'Along Width') {
    return true;
  }
  return part.rotationAllowed;
}

function mergeFreeRects(rects: FreeRect[]): FreeRect[] {
  const list = rects.map((r) => ({...r})).filter((r) => r.length > 0.5 && r.width > 0.5);
  let merged = true;
  const eps = 0.25;

  while (merged) {
    merged = false;
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i];
        const b = list[j];

        if (Math.abs(a.y - b.y) < eps && Math.abs(a.width - b.width) < eps) {
          if (Math.abs(a.x + a.length - b.x) < eps) {
            list[i] = {x: a.x, y: a.y, length: round1(a.length + b.length), width: a.width};
            list.splice(j, 1);
            merged = true;
            break;
          }
          if (Math.abs(b.x + b.length - a.x) < eps) {
            list[i] = {x: b.x, y: a.y, length: round1(a.length + b.length), width: a.width};
            list.splice(j, 1);
            merged = true;
            break;
          }
        }

        if (Math.abs(a.x - b.x) < eps && Math.abs(a.length - b.length) < eps) {
          if (Math.abs(a.y + a.width - b.y) < eps) {
            list[i] = {x: a.x, y: a.y, length: a.length, width: round1(a.width + b.width)};
            list.splice(j, 1);
            merged = true;
            break;
          }
          if (Math.abs(b.y + b.width - a.y) < eps) {
            list[i] = {x: a.x, y: b.y, length: a.length, width: round1(a.width + b.width)};
            list.splice(j, 1);
            merged = true;
            break;
          }
        }
      }
      if (merged) break;
    }
  }

  return list;
}

function splitGuillotineRect(
  rect: FreeRect,
  pw: number,
  ph: number,
  kerf: number
): FreeRect[] {
  const remX = round1(rect.length - pw - kerf);
  const remY = round1(rect.width - ph - kerf);

  const optionARight: FreeRect | null =
    remX > 0.5 ? {x: round1(rect.x + pw + kerf), y: rect.y, length: remX, width: ph} : null;
  const optionABottom: FreeRect | null =
    remY > 0.5 ? {x: rect.x, y: round1(rect.y + ph + kerf), length: rect.length, width: remY} : null;
  const maxAreaA = Math.max(
    optionARight ? optionARight.length * optionARight.width : 0,
    optionABottom ? optionABottom.length * optionABottom.width : 0
  );

  const optionBRight: FreeRect | null =
    remX > 0.5 ? {x: round1(rect.x + pw + kerf), y: rect.y, length: remX, width: rect.width} : null;
  const optionBBottom: FreeRect | null =
    remY > 0.5 ? {x: rect.x, y: round1(rect.y + ph + kerf), length: pw, width: remY} : null;
  const maxAreaB = Math.max(
    optionBRight ? optionBRight.length * optionBRight.width : 0,
    optionBBottom ? optionBBottom.length * optionBBottom.width : 0
  );

  const chosen = maxAreaA >= maxAreaB ? [optionARight, optionABottom] : [optionBRight, optionBBottom];
  return chosen.filter((r): r is FreeRect => r !== null && r.length >= 1 && r.width >= 1);
}

/**
 * Runs 2D guillotine bin-packing grouped by part color/finish so parts of different
 * board colors are never mixed onto the same sheet.
 */
export function runCutOptimization(
  parts: CabinetPart[],
  material: MaterialSettings
): OptimizationResult {
  const sheetL = Math.max(100, material.sheetLength);
  const sheetW = Math.max(100, material.sheetWidth);
  const kerf = Math.max(0, material.kerf);
  const trim = Math.max(0, material.trimMargin);

  const usableL = Math.max(10, round1(sheetL - 2 * trim));
  const usableW = Math.max(10, round1(sheetW - 2 * trim));
  const fallbackColor = material.defaultColor?.trim() || 'Standard';

  const oversizedParts: OversizedPartError[] = [];
  const colorBuckets = new Map<string, {displayColor: string; pieces: ExpandedPiece[]}>();

  for (const part of parts) {
    if (part.quantity <= 0 || part.length <= 0 || part.width <= 0) continue;

    const displayColor = part.color?.trim() || fallbackColor;
    const colorKey = displayColor.toLowerCase();

    const piece: ExpandedPiece = {
      instanceId: '',
      partId: part.id,
      componentType: part.componentType,
      partName: part.partName || part.componentType,
      color: displayColor,
      length: part.length,
      width: part.width,
      rotationAllowed: part.rotationAllowed,
      grainDirection: part.grainDirection,
    };

    const fitsNormal = canPlaceNormal(piece) && part.length <= usableL && part.width <= usableW;
    const fitsRotated = canPlaceRotated(piece) && part.width <= usableL && part.length <= usableW;

    if (!fitsNormal && !fitsRotated) {
      oversizedParts.push({
        partId: part.id,
        partName: piece.partName,
        componentType: part.componentType,
        color: displayColor,
        length: part.length,
        width: part.width,
        reason:
          part.grainDirection !== 'None' || !part.rotationAllowed
            ? `Exceeds usable sheet (${usableL} × ${usableW} mm) under current grain/rotation lock.`
            : `Exceeds usable sheet dimensions (${usableL} × ${usableW} mm).`,
      });
      continue;
    }

    let bucket = colorBuckets.get(colorKey);
    if (!bucket) {
      bucket = {displayColor, pieces: []};
      colorBuckets.set(colorKey, bucket);
    }

    for (let q = 0; q < part.quantity; q++) {
      bucket.pieces.push({
        ...piece,
        instanceId: `${part.id}__${q + 1}`,
      });
    }
  }

  const allBins: BoardBin[] = [];

  for (const {displayColor, pieces} of colorBuckets.values()) {
    pieces.sort((a, b) => {
      const areaDiff = b.length * b.width - a.length * a.width;
      if (Math.abs(areaDiff) > 1) return areaDiff;
      return Math.max(b.length, b.width) - Math.max(a.length, a.width);
    });

    const colorBins: BoardBin[] = [];

    const createNewBin = (): BoardBin => ({
      boardNumber: allBins.length + colorBins.length + 1,
      boardColor: displayColor,
      freeRects: [{x: trim, y: trim, length: usableL, width: usableW}],
      placedParts: [],
    });

    for (const piece of pieces) {
      let bestPlacement: {
        binIndex: number;
        rectIndex: number;
        rotated: boolean;
        pw: number;
        ph: number;
        score: number;
      } | null = null;

      for (let bIdx = 0; bIdx < colorBins.length; bIdx++) {
        const bin = colorBins[bIdx];
        for (let rIdx = 0; rIdx < bin.freeRects.length; rIdx++) {
          const rect = bin.freeRects[rIdx];

          const tryOrient = (rotated: boolean) => {
            const pw = rotated ? piece.width : piece.length;
            const ph = rotated ? piece.length : piece.width;
            if (pw <= rect.length + 0.01 && ph <= rect.width + 0.01) {
              const leftoverX = rect.length - pw;
              const leftoverY = rect.width - ph;
              const shortSideFit = Math.min(leftoverX, leftoverY);
              const longSideFit = Math.max(leftoverX, leftoverY);
              const score = shortSideFit * 100000 + longSideFit + bIdx * 10;
              if (!bestPlacement || score < bestPlacement.score) {
                bestPlacement = {binIndex: bIdx, rectIndex: rIdx, rotated, pw, ph, score};
              }
            }
          };

          if (canPlaceNormal(piece)) tryOrient(false);
          if (canPlaceRotated(piece)) tryOrient(true);
        }
      }

      if (!bestPlacement) {
        const newBin = createNewBin();
        colorBins.push(newBin);
        const bIdx = colorBins.length - 1;
        const rect = newBin.freeRects[0];

        const normalOk =
          canPlaceNormal(piece) && piece.length <= rect.length && piece.width <= rect.width;
        const rotatedOk =
          canPlaceRotated(piece) && piece.width <= rect.length && piece.length <= rect.width;
        const rotated = !normalOk && rotatedOk;
        const pw = rotated ? piece.width : piece.length;
        const ph = rotated ? piece.length : piece.width;

        bestPlacement = {
          binIndex: bIdx,
          rectIndex: 0,
          rotated,
          pw,
          ph,
          score: 0,
        };
      }

      const targetBin = colorBins[bestPlacement.binIndex];
      const targetRect = targetBin.freeRects[bestPlacement.rectIndex];

      targetBin.placedParts.push({
        instanceId: piece.instanceId,
        partId: piece.partId,
        componentType: piece.componentType,
        partName: piece.partName,
        color: piece.color,
        x: round1(targetRect.x),
        y: round1(targetRect.y),
        placedLength: round1(bestPlacement.pw),
        placedWidth: round1(bestPlacement.ph),
        originalLength: piece.length,
        originalWidth: piece.width,
        rotated: bestPlacement.rotated,
        grainDirection: piece.grainDirection,
      });

      const splitRects = splitGuillotineRect(targetRect, bestPlacement.pw, bestPlacement.ph, kerf);
      targetBin.freeRects.splice(bestPlacement.rectIndex, 1, ...splitRects);
    }

    allBins.push(...colorBins);
  }

  // Re-number boards sequentially 1..N
  allBins.forEach((b, idx) => {
    b.boardNumber = idx + 1;
  });

  const sheetAreaMm2 = sheetL * sheetW;
  const allOffcuts: OffcutRect[] = [];
  let totalUsedAreaMm2 = 0;
  let totalPiecesPlaced = 0;

  const boards: BoardResult[] = allBins.map((bin) => {
    totalPiecesPlaced += bin.placedParts.length;

    const mergedFree = mergeFreeRects(bin.freeRects)
      .filter((r) => r.length >= 15 && r.width >= 15)
      .sort((a, b) => b.length * b.width - a.length * a.width);

    const offcuts: OffcutRect[] = mergedFree.map((r, idx) => {
      const areaMm2 = Math.round(r.length * r.width);
      const offcut: OffcutRect = {
        id: `offcut-b${bin.boardNumber}-${idx + 1}`,
        boardNumber: bin.boardNumber,
        boardColor: bin.boardColor,
        x: round1(r.x),
        y: round1(r.y),
        length: round1(r.length),
        width: round1(r.width),
        areaMm2,
        areaM2: Math.round((areaMm2 / 1_000_000) * 1000) / 1000,
      };
      allOffcuts.push(offcut);
      return offcut;
    });

    const usedAreaMm2 = bin.placedParts.reduce(
      (sum, p) => sum + p.placedLength * p.placedWidth,
      0
    );
    totalUsedAreaMm2 += usedAreaMm2;

    const offcutAreaMm2 = offcuts.reduce((sum, o) => sum + o.areaMm2, 0);
    const utilizationPercent = Math.round((usedAreaMm2 / sheetAreaMm2) * 1000) / 10;

    const groupMap = new Map<ComponentType, PlacedPart[]>();
    for (const p of bin.placedParts) {
      const existing = groupMap.get(p.componentType) || [];
      existing.push(p);
      groupMap.set(p.componentType, existing);
    }

    const componentGroups: ComponentGroupSummary[] = COMPONENT_TYPES.filter((type) =>
      groupMap.has(type)
    ).map((type) => {
      const groupParts = groupMap.get(type)!;
      const areaM2 =
        Math.round(
          (groupParts.reduce((s, p) => s + p.placedLength * p.placedWidth, 0) / 1_000_000) * 1000
        ) / 1000;
      return {
        componentType: type,
        count: groupParts.length,
        totalAreaM2: areaM2,
        parts: groupParts,
      };
    });

    return {
      boardNumber: bin.boardNumber,
      boardColor: bin.boardColor,
      sheetLength: sheetL,
      sheetWidth: sheetW,
      placedParts: bin.placedParts,
      componentGroups,
      offcuts,
      usedAreaMm2: Math.round(usedAreaMm2),
      offcutAreaMm2,
      utilizationPercent,
    };
  });

  // Summarize boards per color
  const colorSummaryMap = new Map<
    string,
    {color: string; boards: number; pieces: number; usedAreaMm2: number}
  >();
  for (const b of boards) {
    const key = b.boardColor.toLowerCase();
    const cur = colorSummaryMap.get(key) || {
      color: b.boardColor,
      boards: 0,
      pieces: 0,
      usedAreaMm2: 0,
    };
    cur.boards += 1;
    cur.pieces += b.placedParts.length;
    cur.usedAreaMm2 += b.usedAreaMm2;
    colorSummaryMap.set(key, cur);
  }

  const colorSummaries: ColorBoardSummary[] = Array.from(colorSummaryMap.values()).map((c) => ({
    color: c.color,
    boards: c.boards,
    pieces: c.pieces,
    utilizationPercent:
      c.boards > 0 ? Math.round((c.usedAreaMm2 / (c.boards * sheetAreaMm2)) * 1000) / 10 : 0,
  }));

  const totalBoards = boards.length;
  const totalSheetAreaM2 = Math.round(((totalBoards * sheetAreaMm2) / 1_000_000) * 100) / 100;
  const totalUsedAreaM2 = Math.round((totalUsedAreaMm2 / 1_000_000) * 100) / 100;
  const totalOffcutAreaM2 =
    Math.round((allOffcuts.reduce((s, o) => s + o.areaMm2, 0) / 1_000_000) * 100) / 100;
  const overallUtilizationPercent =
    totalBoards > 0
      ? Math.round((totalUsedAreaMm2 / (totalBoards * sheetAreaMm2)) * 1000) / 10
      : 0;

  return {
    boards,
    colorSummaries,
    allOffcuts,
    oversizedParts,
    totalBoards,
    totalPiecesPlaced,
    totalSheetAreaM2,
    totalUsedAreaM2,
    totalOffcutAreaM2,
    overallUtilizationPercent,
    generatedAt: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
  };
}
