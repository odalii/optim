import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {resolveColorHex} from '../data/presets';
import {
  CabinetPart,
  COMPONENT_TYPE_META,
  MaterialSettings,
  OptimizationResult,
  ProjectInfo,
} from '../types/cabinet';

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return [203, 213, 225];
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return [r, g, b];
}

export interface PdfExportOptions {
  projectInfo: ProjectInfo;
  material: MaterialSettings;
  parts: CabinetPart[];
  optimization: OptimizationResult;
}

/**
 * Generates a downloadable, shop-floor-ready PDF containing:
 * 1. Cutting List Schedule (client/project header, stock board summary per color,
 *    part sizes, exact quantities, cut color with swatch, edge sides E1-E4, groove sides G1-G4).
 * 2. Vector 2D Board Cut Optimization Layouts grouped by board & color.
 * 3. Offcuts Schedule.
 */
export function generateCutListPdf({
  projectInfo,
  material,
  parts,
  optimization,
}: PdfExportOptions): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;
  const totalPieces = parts.reduce((sum, p) => sum + p.quantity, 0);

  // --- PAGE 1: CUTTING LIST SCHEDULE (Spreadsheet-style shop sheet) ---
  // Top Header Banner
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.4);
  doc.rect(margin, margin, contentWidth, 22);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(29, 78, 216); // Blueprint Blue for Client/Workshop
  doc.text((projectInfo.clientName || 'WORKSHOP CUTTING LIST').toUpperCase(), margin + 4, margin + 7);

  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text((projectInfo.projectName || 'CABINETRY PROJECT').toUpperCase(), margin + 4, margin + 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Material: ${material.materialName} (${material.thickness}mm)  |  Kerf: ${material.kerf}mm  |  Trim: ${material.trimMargin}mm`,
    margin + 4,
    margin + 19.5
  );

  // Right side metadata inside header box
  const rightColX = pageWidth - margin - 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(`REF: ${projectInfo.jobReference || '—'}`, rightColX, margin + 7, {align: 'right'});

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text(
    `Boards Needed: ${optimization.totalBoards} pcs   |   Total Parts: ${totalPieces}`,
    rightColX,
    margin + 13.5,
    {align: 'right'}
  );
  doc.text(
    `Date: ${new Date().toLocaleDateString()}   |   Yield: ${optimization.overallUtilizationPercent.toFixed(1)}%`,
    rightColX,
    margin + 19.5,
    {align: 'right'}
  );

  // Stock Board Summary Bar by Color (mirrors the 2400 | 1200 | 3 pcs | Color header rows)
  let cursorY = margin + 25;

  const stockRows = optimization.colorSummaries.map((cs) => [
    'STOCK SHEET',
    `${material.materialName} (${material.thickness}mm)`,
    String(material.sheetLength),
    String(material.sheetWidth),
    `${cs.boards} pcs`,
    cs.color,
    `${cs.pieces} cuts`,
    `${cs.utilizationPercent.toFixed(1)}%`,
  ]);

  if (stockRows.length > 0) {
    autoTable(doc, {
      startY: cursorY,
      margin: {left: margin, right: margin},
      head: [
        [
          'SHEET',
          'MATERIAL',
          'LENGTH',
          'WIDTH',
          'BOARDS',
          'COLOR',
          'CUTS',
          'YIELD',
        ],
      ],
      body: stockRows,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        textColor: [15, 23, 42],
        lineColor: [148, 163, 184],
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: [241, 245, 249],
        textColor: [15, 23, 42],
        fontStyle: 'bold',
        halign: 'center',
      },
      columnStyles: {
        0: {fontStyle: 'bold', cellWidth: 22},
        2: {halign: 'right', cellWidth: 18},
        3: {halign: 'right', cellWidth: 18},
        4: {halign: 'center', fontStyle: 'bold', cellWidth: 18},
        5: {fontStyle: 'bold', cellWidth: 34},
        6: {halign: 'center', cellWidth: 16},
        7: {halign: 'right', cellWidth: 16},
      },
      didDrawCell: (data) => {
        if (data.section === 'body' && data.column.index === 5) {
          const colorText = String(data.cell.raw || '');
          const [r, g, b] = hexToRgb(resolveColorHex(colorText));
          doc.setFillColor(r, g, b);
          doc.setDrawColor(100, 116, 139);
          doc.rect(data.cell.x + 2, data.cell.y + data.cell.height / 2 - 1.5, 3, 3, 'FD');
        }
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 5) {
          data.cell.styles.cellPadding = {top: 2, right: 2, bottom: 2, left: 6.5};
        }
      },
    });
    cursorY = (doc as unknown as {lastAutoTable: {finalY: number}}).lastAutoTable.finalY + 5;
  }

  // Main Cut Parts Schedule Table (matching image_e0edffc6.png structure)
  const partRows = parts.map((part, idx) => {
    const label =
      part.partName && part.partName !== part.componentType
        ? `${part.componentType} — ${part.partName}`
        : part.componentType;
    return [
      `${idx + 1}.`,
      label,
      String(part.length),
      String(part.width),
      String(part.quantity),
      part.color || material.defaultColor || 'Standard',
      part.edgeSides.e1 ? 'x' : '',
      part.edgeSides.e2 ? 'x' : '',
      part.edgeSides.e3 ? 'x' : '',
      part.edgeSides.e4 ? 'x' : '',
      part.grooveSides.g1 ? 'x' : '',
      part.grooveSides.g2 ? 'x' : '',
      part.grooveSides.g3 ? 'x' : '',
      part.grooveSides.g4 ? 'x' : '',
    ];
  });

  autoTable(doc, {
    startY: cursorY,
    margin: {left: margin, right: margin},
    head: [
      [
        {content: '#', rowSpan: 2, styles: {valign: 'middle', halign: 'center'}},
        {content: 'COMPONENT / PART', rowSpan: 2, styles: {valign: 'middle'}},
        {content: 'PART SIZES (mm)', colSpan: 2, styles: {halign: 'center'}},
        {content: 'PIECES', colSpan: 1, styles: {halign: 'center'}},
        {content: 'CUT COLOR', rowSpan: 2, styles: {valign: 'middle', halign: 'center'}},
        {content: 'EDGE SIDES', colSpan: 4, styles: {halign: 'center'}},
        {content: 'GROOVE SIDE', colSpan: 4, styles: {halign: 'center'}},
      ],
      [
        {content: 'LENGTH', styles: {halign: 'right'}},
        {content: 'WIDTH', styles: {halign: 'right'}},
        {content: 'QTY', styles: {halign: 'center'}},
        {content: 'E1', styles: {halign: 'center'}},
        {content: 'E2', styles: {halign: 'center'}},
        {content: 'E3', styles: {halign: 'center'}},
        {content: 'E4', styles: {halign: 'center'}},
        {content: 'G1', styles: {halign: 'center'}},
        {content: 'G2', styles: {halign: 'center'}},
        {content: 'G3', styles: {halign: 'center'}},
        {content: 'G4', styles: {halign: 'center'}},
      ],
    ],
    body: partRows,
    foot: [
      [
        '',
        'TOTAL PIECES TO CUT',
        '',
        '',
        String(totalPieces),
        `${optimization.colorSummaries.length} color(s)`,
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
      ],
    ],
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 1.8,
      textColor: [15, 23, 42],
      lineColor: [100, 116, 139],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [226, 232, 240],
      textColor: [15, 23, 42],
      fontStyle: 'bold',
    },
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: 'bold',
    },
    columnStyles: {
      0: {halign: 'center', cellWidth: 8},
      1: {cellWidth: 46},
      2: {halign: 'right', cellWidth: 16},
      3: {halign: 'right', cellWidth: 16},
      4: {halign: 'center', fontStyle: 'bold', cellWidth: 12},
      5: {cellWidth: 30},
      6: {halign: 'center', cellWidth: 7},
      7: {halign: 'center', cellWidth: 7},
      8: {halign: 'center', cellWidth: 7},
      9: {halign: 'center', cellWidth: 7},
      10: {halign: 'center', cellWidth: 7.5},
      11: {halign: 'center', cellWidth: 7.5},
      12: {halign: 'center', cellWidth: 7.5},
      13: {halign: 'center', cellWidth: 7.5},
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 5) {
        data.cell.styles.cellPadding = {top: 1.8, right: 1.8, bottom: 1.8, left: 6.2};
      }
    },
    didDrawCell: (data) => {
      if (data.section === 'body' && data.column.index === 5) {
        const colorText = String(data.cell.raw || '');
        const [r, g, b] = hexToRgb(resolveColorHex(colorText));
        doc.setFillColor(r, g, b);
        doc.setDrawColor(71, 85, 105);
        doc.rect(data.cell.x + 1.8, data.cell.y + data.cell.height / 2 - 1.5, 3, 3, 'FD');
      }
    },
  });

  // --- SUBSEQUENT PAGES: VECTOR 2D BOARD CUT OPTIMIZATION DIAGRAMS ---
  if (optimization.boards.length > 0) {
    doc.addPage();
    let yPos = margin;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('OPTIMIZED SHEET CUTTING LAYOUTS', margin, yPos + 4);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(
      `${projectInfo.projectName || 'Project'}  |  ${optimization.totalBoards} Boards  |  Kerf ${material.kerf}mm`,
      margin,
      yPos + 9
    );
    yPos += 14;

    const maxDiagramW = contentWidth;
    const maxDiagramH = 82;

    for (let i = 0; i < optimization.boards.length; i++) {
      const board = optimization.boards[i];
      const scale = Math.min(
        maxDiagramW / board.sheetLength,
        maxDiagramH / board.sheetWidth
      );
      const drawW = board.sheetLength * scale;
      const drawH = board.sheetWidth * scale;

      const groupSummaryText = board.componentGroups
        .map((g) => `${COMPONENT_TYPE_META[g.componentType].plural}: ${g.count}`)
        .join('  ·  ');

      const blockNeededH = 14 + drawH + 14;
      if (yPos + blockNeededH > pageHeight - margin) {
        doc.addPage();
        yPos = margin;
      }

      // Board Header Strip
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(203, 213, 225);
      doc.rect(margin, yPos, contentWidth, 9, 'FD');

      const [cr, cg, cb] = hexToRgb(resolveColorHex(board.boardColor));
      doc.setFillColor(cr, cg, cb);
      doc.setDrawColor(71, 85, 105);
      doc.rect(margin + 3, yPos + 2.8, 3.4, 3.4, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(
        `Board ${board.boardNumber} — ${board.boardColor}`,
        margin + 8.5,
        yPos + 5.8
      );

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text(
        `${board.sheetLength} × ${board.sheetWidth} mm  |  ${board.placedParts.length} pcs  |  Yield: ${board.utilizationPercent.toFixed(1)}%`,
        pageWidth - margin - 3,
        yPos + 5.8,
        {align: 'right'}
      );

      const sheetX = margin;
      const sheetY = yPos + 12;

      // Sheet Outline
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(15, 23, 42);
      doc.setLineWidth(0.4);
      doc.rect(sheetX, sheetY, drawW, drawH, 'FD');

      // Offcuts
      for (const off of board.offcuts) {
        doc.setFillColor(241, 245, 249);
        doc.setDrawColor(148, 163, 184);
        doc.setLineWidth(0.15);
        doc.rect(
          sheetX + off.x * scale,
          sheetY + off.y * scale,
          off.length * scale,
          off.width * scale,
          'FD'
        );
      }

      // Placed Parts
      for (const part of board.placedParts) {
        const meta = COMPONENT_TYPE_META[part.componentType];
        const [pr, pg, pb] = hexToRgb(meta.cadFill);
        const [sr, sg, sb] = hexToRgb(meta.cadStroke);
        const rx = sheetX + part.x * scale;
        const ry = sheetY + part.y * scale;
        const rw = part.placedLength * scale;
        const rh = part.placedWidth * scale;

        doc.setFillColor(pr, pg, pb);
        doc.setDrawColor(sr, sg, sb);
        doc.setLineWidth(0.25);
        doc.rect(rx, ry, rw, rh, 'FD');

        if (rw >= 14 && rh >= 8) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(rw >= 26 && rh >= 14 ? 6.5 : 5);
          doc.setTextColor(15, 23, 42);
          doc.text(
            `${meta.shortCode} ${part.placedLength}×${part.placedWidth}${part.rotated ? ' R' : ''}`,
            rx + rw / 2,
            ry + rh / 2 + 1,
            {align: 'center'}
          );
        }
      }

      // Component Group Line beneath Board Diagram
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(51, 65, 85);
      doc.text(groupSummaryText, margin, sheetY + drawH + 4.5, {
        maxWidth: contentWidth,
      });

      yPos = sheetY + drawH + 12;
    }
  }

  // --- OFFCUTS SUMMARY PAGE / SECTION ---
  if (optimization.allOffcuts.length > 0) {
    doc.addPage();

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('OFFCUTS SCHEDULE', margin, margin + 4);

    autoTable(doc, {
      startY: margin + 8,
      margin: {left: margin, right: margin},
      head: [['Board #', 'Board Color', 'Offcut Length (mm)', 'Offcut Width (mm)', 'Area (m²)', 'Area (mm²)']],
      body: optimization.allOffcuts.map((o) => [
        `Board ${o.boardNumber}`,
        o.boardColor,
        String(o.length),
        String(o.width),
        `${o.areaM2.toFixed(3)} m²`,
        `${o.areaMm2.toLocaleString()} mm²`,
      ]),
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        textColor: [15, 23, 42],
        lineColor: [148, 163, 184],
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: [226, 232, 240],
        textColor: [15, 23, 42],
        fontStyle: 'bold',
      },
      columnStyles: {
        2: {halign: 'right'},
        3: {halign: 'right'},
        4: {halign: 'right', fontStyle: 'bold'},
        5: {halign: 'right'},
      },
    });
  }

  const safeFileBase = (
    projectInfo.jobReference ||
    projectInfo.projectName ||
    'kerfplan-cut-list'
  )
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-');

  doc.save(`${safeFileBase}-cutting-list.pdf`);
}
