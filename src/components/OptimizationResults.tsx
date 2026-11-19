import React, {useState} from 'react';
import {AlertTriangle, Download, FileDown, Printer} from 'lucide-react';
import {resolveColorHex} from '../data/presets';
import {
  COMPONENT_TYPE_META,
  ComponentType,
  MaterialSettings,
  OptimizationResult,
  ProjectInfo,
} from '../types/cabinet';
import {BoardDiagram} from './BoardDiagram';

interface OptimizationResultsProps {
  result: OptimizationResult | null;
  material: MaterialSettings;
  projectInfo: ProjectInfo;
  highlightedOffcutId: string | null;
  onClearOffcutHighlight: () => void;
  onExportPdf: () => void;
}

export const OptimizationResults: React.FC<OptimizationResultsProps> = ({
  result,
  material,
  projectInfo,
  highlightedOffcutId,
  onClearOffcutHighlight,
  onExportPdf,
}) => {
  const [hoveredTypeByBoard, setHoveredTypeByBoard] = useState<
    Record<number, ComponentType | null>
  >({});
  const [hoveredPartByBoard, setHoveredPartByBoard] = useState<
    Record<number, string | null>
  >({});

  const handleExportCsv = () => {
    if (!result) return;
    const rows = [
      [
        'Board Number',
        'Board Color',
        'Component Type',
        'Part Name',
        'Cut Length (mm)',
        'Cut Width (mm)',
        'X (mm)',
        'Y (mm)',
        'Rotated 90deg',
        'Grain Direction',
      ].join(','),
    ];

    for (const board of result.boards) {
      for (const p of board.placedParts) {
        rows.push(
          [
            board.boardNumber,
            `"${board.boardColor.replace(/"/g, '""')}"`,
            `"${p.componentType}"`,
            `"${p.partName.replace(/"/g, '""')}"`,
            p.placedLength,
            p.placedWidth,
            p.x,
            p.y,
            p.rotated ? 'Yes' : 'No',
            `"${p.grainDirection}"`,
          ].join(',')
        );
      }
    }

    const blob = new Blob([rows.join('\n')], {type: 'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(projectInfo.jobReference || 'cut-list').toLowerCase()}-boards.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!result) {
    return (
      <section
        id="optimization-results"
        aria-labelledby="optimization-heading"
        className="bg-white border border-slate-200 rounded-lg p-10 text-center"
      >
        <h2 id="optimization-heading" className="font-display text-base font-semibold text-slate-900">
          Optimization Results
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Click Generate Optimization in the Project Summary to calculate board layouts grouped by component type and color, or export the PDF cutting schedule.
        </p>
      </section>
    );
  }

  return (
    <section
      id="optimization-results"
      aria-labelledby="optimization-heading"
      className="space-y-6"
    >
      {/* Header & KPI Metrics */}
      <div className="bg-white border border-slate-200 rounded-lg">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 id="optimization-heading" className="font-display text-base font-semibold text-slate-900">
              Optimization Results
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
              {material.materialName} · {material.sheetLength} × {material.sheetWidth} mm · Computed at {result.generatedAt}
            </p>
          </div>

          <div className="no-print flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onExportPdf}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors whitespace-nowrap cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Download Cut List PDF</span>
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition-colors whitespace-nowrap cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Export Cut CSV</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition-colors whitespace-nowrap cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Print Cut Sheets</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          <div className="p-5">
            <div className="text-xs font-medium text-slate-500">Sheets Required</div>
            <div className="mt-1 text-2xl font-display font-bold tabular-nums text-slate-900">
              {result.totalBoards}
            </div>
            <div className="mt-0.5 text-xs font-mono tabular-nums text-slate-500">
              {result.totalPiecesPlaced} pieces placed
            </div>
          </div>

          <div className="p-5">
            <div className="text-xs font-medium text-slate-500">Sheet Utilization</div>
            <div className="mt-1 text-2xl font-display font-bold tabular-nums text-slate-900">
              {result.overallUtilizationPercent.toFixed(1)}%
            </div>
            <div className="mt-0.5 text-xs font-mono tabular-nums text-slate-500">
              {result.totalUsedAreaM2.toFixed(2)} / {result.totalSheetAreaM2.toFixed(2)} m²
            </div>
          </div>

          <div className="p-5">
            <div className="text-xs font-medium text-slate-500">Tracked Offcuts</div>
            <div className="mt-1 text-2xl font-display font-bold tabular-nums text-slate-900">
              {result.allOffcuts.length}
            </div>
            <div className="mt-0.5 text-xs font-mono tabular-nums text-slate-500">
              {result.totalOffcutAreaM2.toFixed(2)} m² recoverable
            </div>
          </div>

          <div className="p-5">
            <div className="text-xs font-medium text-slate-500">Saw Kerf Allowance</div>
            <div className="mt-1 text-2xl font-display font-bold tabular-nums text-slate-900">
              {material.kerf} mm
            </div>
            <div className="mt-0.5 text-xs font-mono tabular-nums text-slate-500">
              {material.trimMargin} mm perimeter trim
            </div>
          </div>
        </div>

        {/* Boards Required by Color Strip */}
        {result.colorSummaries.length > 0 && (
          <div className="px-6 py-3 bg-slate-50/70 border-t border-slate-200 flex flex-wrap items-center gap-6 text-xs">
            <span className="font-semibold text-slate-600">Boards by Color:</span>
            {result.colorSummaries.map((cs) => (
              <div key={cs.color} className="inline-flex items-center gap-2 text-slate-800">
                <span
                  aria-hidden="true"
                  className="w-3 h-3 rounded-xs border border-slate-400 shrink-0"
                  style={{backgroundColor: resolveColorHex(cs.color)}}
                />
                <span className="font-semibold">{cs.color}</span>
                <span className="text-slate-500 font-mono tabular-nums">
                  {cs.boards} {cs.boards === 1 ? 'board' : 'boards'} · {cs.pieces} pcs · {cs.utilizationPercent.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Oversized Parts Alert */}
      {result.oversizedParts.length > 0 && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 rounded-lg p-5 space-y-2"
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-red-900">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" aria-hidden="true" />
            <span>
              {result.oversizedParts.length} component line{result.oversizedParts.length > 1 ? 's' : ''} could not fit on the current sheet size
            </span>
          </div>
          <ul className="space-y-1 text-xs text-red-800 pl-6 list-disc">
            {result.oversizedParts.map((item) => (
              <li key={item.partId}>
                <strong>{item.componentType}</strong> ({item.partName} · {item.color}) —{' '}
                <span className="font-mono tabular-nums">
                  {item.length} × {item.width} mm
                </span>
                : {item.reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Boards Grouped by Component Type + Cut Diagram */}
      <div className="space-y-6">
        {result.boards.map((board) => {
          const hoveredType = hoveredTypeByBoard[board.boardNumber] || null;
          const hoveredPart = hoveredPartByBoard[board.boardNumber] || null;

          return (
            <article
              key={board.boardNumber}
              id={`board-${board.boardNumber}`}
              className="print-break-inside-avoid bg-white border border-slate-200 rounded-lg overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-display text-base font-bold text-slate-900">
                    Board {board.boardNumber}
                  </h3>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                    <span
                      aria-hidden="true"
                      className="w-3.5 h-3.5 rounded-xs border border-slate-400 shrink-0"
                      style={{backgroundColor: resolveColorHex(board.boardColor)}}
                    />
                    <span>{board.boardColor}</span>
                  </span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="text-xs font-mono tabular-nums text-slate-500">
                    {board.sheetLength} × {board.sheetWidth} mm
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono tabular-nums text-slate-600">
                  <span>{board.placedParts.length} pieces</span>
                  <span aria-hidden="true">·</span>
                  <span>{board.utilizationPercent.toFixed(1)}% yield</span>
                  <span aria-hidden="true">·</span>
                  <span>{board.offcuts.length} offcuts</span>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 divide-y xl:divide-y-0 xl:divide-x divide-slate-200">
                {/* Left Column: Component Type Grouping List */}
                <div className="xl:col-span-4 p-6 space-y-5">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                      Components on Board {board.boardNumber}
                    </h4>

                    <ul className="space-y-3">
                      {board.componentGroups.map((group) => {
                        const meta = COMPONENT_TYPE_META[group.componentType];
                        const isHovered = hoveredType === group.componentType;
                        return (
                          <li
                            key={group.componentType}
                            onMouseEnter={() => {
                              onClearOffcutHighlight();
                              setHoveredTypeByBoard((prev) => ({
                                ...prev,
                                [board.boardNumber]: group.componentType,
                              }));
                            }}
                            onMouseLeave={() =>
                              setHoveredTypeByBoard((prev) => ({
                                ...prev,
                                [board.boardNumber]: null,
                              }))
                            }
                            className={`p-3 rounded-md border transition-colors ${
                              isHovered
                                ? 'border-blue-600 bg-blue-50/40'
                                : 'border-slate-200 bg-white'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                                <span
                                  aria-hidden="true"
                                  className="w-3 h-3 rounded-xs border shrink-0"
                                  style={{
                                    backgroundColor: meta.cadFill,
                                    borderColor: meta.cadStroke,
                                  }}
                                />
                                <span>{meta.plural}</span>
                              </span>
                              <span className="text-xs font-mono tabular-nums font-semibold text-slate-700">
                                {group.count} pcs
                              </span>
                            </div>

                            <ul className="mt-2 space-y-1 pl-5 border-t border-slate-100 pt-2">
                              {group.parts.map((part) => (
                                <li
                                  key={part.instanceId}
                                  onMouseEnter={(e) => {
                                    e.stopPropagation();
                                    setHoveredPartByBoard((prev) => ({
                                      ...prev,
                                      [board.boardNumber]: part.instanceId,
                                    }));
                                  }}
                                  onMouseLeave={(e) => {
                                    e.stopPropagation();
                                    setHoveredPartByBoard((prev) => ({
                                      ...prev,
                                      [board.boardNumber]: null,
                                    }));
                                  }}
                                  className="flex items-center justify-between text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
                                >
                                  <span className="truncate pr-2">{part.partName}</span>
                                  <span className="font-mono tabular-nums text-slate-700 shrink-0">
                                    {part.originalLength} × {part.originalWidth}
                                    {part.rotated ? ' (R)' : ''}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>

                {/* Right Column: Interactive 2D CAD Sheet Diagram */}
                <div className="xl:col-span-8 p-6 flex flex-col justify-between gap-3">
                  <BoardDiagram
                    board={board}
                    highlightedComponentType={hoveredType}
                    highlightedPartId={hoveredPart}
                    highlightedOffcutId={highlightedOffcutId}
                    onHoverPart={(instanceId) =>
                      setHoveredPartByBoard((prev) => ({
                        ...prev,
                        [board.boardNumber]: instanceId,
                      }))
                    }
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                    <span>
                      Hover a component group or cut piece to inspect placement · Hatched regions indicate offcuts
                    </span>
                    <span className="font-mono tabular-nums">
                      (R) = Rotated 90° on sheet
                    </span>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
