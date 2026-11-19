import React, {useMemo} from 'react';
import {Check, FileDown, Play} from 'lucide-react';
import {resolveColorHex} from '../data/presets';
import {
  CabinetPart,
  COMPONENT_TYPE_META,
  COMPONENT_TYPES,
  ComponentType,
  MaterialSettings,
} from '../types/cabinet';

interface ProjectSummaryProps {
  parts: CabinetPart[];
  material: MaterialSettings;
  onGenerateOptimization: () => void;
  onExportPdf: () => void;
  isStale?: boolean;
}

export const ProjectSummary: React.FC<ProjectSummaryProps> = ({
  parts,
  material,
  onGenerateOptimization,
  onExportPdf,
  isStale = false,
}) => {
  const summary = useMemo(() => {
    const counts = new Map<ComponentType, number>();
    const colorCounts = new Map<string, {display: string; count: number}>();
    let totalPieces = 0;
    let totalAreaMm2 = 0;

    for (const part of parts) {
      if (part.quantity <= 0) continue;
      counts.set(
        part.componentType,
        (counts.get(part.componentType) || 0) + part.quantity
      );
      const colorName = part.color?.trim() || material.defaultColor || 'Standard';
      const colorKey = colorName.toLowerCase();
      const existingColor = colorCounts.get(colorKey);
      if (existingColor) {
        existingColor.count += part.quantity;
      } else {
        colorCounts.set(colorKey, {display: colorName, count: part.quantity});
      }
      totalPieces += part.quantity;
      totalAreaMm2 += part.length * part.width * part.quantity;
    }

    const grouped = COMPONENT_TYPES.filter((type) => counts.has(type)).map((type) => ({
      type,
      plural: COMPONENT_TYPE_META[type].plural,
      count: counts.get(type)!,
    }));

    const colors = Array.from(colorCounts.values());
    const sheetAreaMm2 = Math.max(1, material.sheetLength * material.sheetWidth);
    const totalAreaM2 = Math.round((totalAreaMm2 / 1_000_000) * 100) / 100;
    const minTheoreticalSheets =
      totalPieces > 0 ? Math.ceil(totalAreaMm2 / sheetAreaMm2) : 0;

    return {grouped, colors, totalPieces, totalAreaM2, minTheoreticalSheets};
  }, [parts, material.sheetLength, material.sheetWidth, material.defaultColor]);

  return (
    <aside
      id="project-summary"
      aria-labelledby="project-summary-heading"
      className="bg-white border border-slate-200 rounded-lg p-6 lg:sticky lg:top-22"
    >
      <div className="pb-4 border-b border-slate-200">
        <h2
          id="project-summary-heading"
          className="font-display text-sm font-bold tracking-wide text-slate-900"
        >
          Project Summary
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Pre-optimization bill of materials
        </p>
      </div>

      <div className="py-4 border-b border-slate-100 space-y-1">
        <div className="text-xs font-medium text-slate-500">Material</div>
        <div className="text-sm font-semibold text-slate-900">
          {material.materialName || 'Unspecified Sheet Material'}
        </div>
        <div className="text-xs font-mono tabular-nums text-slate-500">
          {material.sheetLength} × {material.sheetWidth} mm · {material.thickness}mm · {material.kerf}mm kerf
        </div>
      </div>

      {summary.colors.length > 0 && (
        <div className="py-4 border-b border-slate-100">
          <div className="text-xs font-medium text-slate-500 mb-2.5">Cut Colors</div>
          <ul className="space-y-1.5">
            {summary.colors.map((c) => (
              <li
                key={c.display}
                className="flex items-center justify-between text-xs text-slate-800"
              >
                <span className="inline-flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="w-3 h-3 rounded-xs border border-slate-400 shrink-0"
                    style={{backgroundColor: resolveColorHex(c.display)}}
                  />
                  <span className="font-medium">{c.display}</span>
                </span>
                <span className="font-mono tabular-nums text-slate-600">
                  {c.count} pcs
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="py-4 border-b border-slate-100">
        <div className="text-xs font-medium text-slate-500 mb-3">Components</div>
        {summary.grouped.length === 0 ? (
          <p className="text-xs text-slate-400">No components queued yet.</p>
        ) : (
          <ul className="space-y-2">
            {summary.grouped.map((item) => (
              <li
                key={item.type}
                className="flex items-center justify-between text-sm text-slate-800"
              >
                <span className="inline-flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
                  <span>{item.plural}</span>
                </span>
                <span className="font-mono tabular-nums font-semibold text-slate-900">
                  {item.count}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="py-4 space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="text-xs font-medium text-slate-500">Total Pieces</span>
          <span className="text-xl font-display font-bold tabular-nums text-slate-900">
            {summary.totalPieces}
          </span>
        </div>
        <div className="flex items-baseline justify-between text-xs text-slate-500">
          <span>Net Cut Area</span>
          <span className="font-mono tabular-nums text-slate-700">
            {summary.totalAreaM2.toFixed(2)} m²
          </span>
        </div>
        <div className="flex items-baseline justify-between text-xs text-slate-500">
          <span>Min. Theoretical Sheets</span>
          <span className="font-mono tabular-nums text-slate-700">
            {summary.minTheoreticalSheets}
          </span>
        </div>
      </div>

      <div className="space-y-2.5">
        <button
          type="button"
          onClick={onGenerateOptimization}
          disabled={summary.totalPieces === 0}
          className="w-full h-11 inline-flex items-center justify-center gap-2 px-4 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 disabled:bg-slate-200 disabled:text-slate-500 rounded-md transition-colors cursor-pointer disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          <Play className="w-4 h-4 fill-current" aria-hidden="true" />
          <span>Generate Optimization</span>
        </button>

        <button
          type="button"
          onClick={onExportPdf}
          disabled={summary.totalPieces === 0}
          className="w-full h-10 inline-flex items-center justify-center gap-2 px-4 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400 rounded-md transition-colors cursor-pointer disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <FileDown className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Download Cut List PDF</span>
        </button>
      </div>

      {isStale && summary.totalPieces > 0 && (
        <p className="mt-2.5 text-xs text-amber-700 text-center">
          Parts or material settings changed. Re-run optimization to update cut layouts.
        </p>
      )}
    </aside>
  );
};
