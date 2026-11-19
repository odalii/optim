import React, {useMemo, useState} from 'react';
import {Crosshair} from 'lucide-react';
import {resolveColorHex} from '../data/presets';
import {OffcutRect} from '../types/cabinet';

interface OffcutsTableProps {
  offcuts: OffcutRect[];
  highlightedOffcutId: string | null;
  onLocateOffcut: (offcut: OffcutRect) => void;
}

export const OffcutsTable: React.FC<OffcutsTableProps> = ({
  offcuts,
  highlightedOffcutId,
  onLocateOffcut,
}) => {
  const [minFilter, setMinFilter] = useState<'all' | 'reusable'>('all');

  const filteredOffcuts = useMemo(() => {
    if (minFilter === 'reusable') {
      return offcuts.filter((o) => o.length >= 150 && o.width >= 150);
    }
    return offcuts;
  }, [offcuts, minFilter]);

  const totalAreaM2 = useMemo(
    () =>
      Math.round(
        (filteredOffcuts.reduce((sum, o) => sum + o.areaMm2, 0) / 1_000_000) * 1000
      ) / 1000,
    [filteredOffcuts]
  );

  return (
    <section
      id="offcuts"
      aria-labelledby="offcuts-heading"
      className="bg-white border border-slate-200 rounded-lg"
    >
      <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 id="offcuts-heading" className="font-display text-base font-semibold text-slate-900">
            Offcuts
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
            {filteredOffcuts.length} offcut {filteredOffcuts.length === 1 ? 'region' : 'regions'} · Total area {totalAreaM2.toFixed(3)} m²
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-md">
          <button
            type="button"
            onClick={() => setMinFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
              minFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Offcuts ({offcuts.length})
          </button>
          <button
            type="button"
            onClick={() => setMinFilter('reusable')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
              minFilter === 'reusable'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Usable Stock (≥ 150 mm)
          </button>
        </div>
      </div>

      {filteredOffcuts.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500">
          {offcuts.length === 0
            ? 'Run optimization to inspect remaining offcut dimensions and areas.'
            : 'No offcuts meet the 150 × 150 mm reusable threshold.'}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-600">
                <th className="py-2.5 px-6 whitespace-nowrap">Associated Board Number</th>
                <th className="py-2.5 px-4 whitespace-nowrap">Board Color</th>
                <th className="py-2.5 px-4 text-right whitespace-nowrap">Offcut Length (mm)</th>
                <th className="py-2.5 px-4 text-right whitespace-nowrap">Offcut Width (mm)</th>
                <th className="py-2.5 px-4 text-right whitespace-nowrap">Area (m²)</th>
                <th className="py-2.5 px-4 text-right whitespace-nowrap">Area (mm²)</th>
                <th className="py-2.5 px-6 text-right whitespace-nowrap no-print">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOffcuts.map((offcut) => {
                const isSelected = highlightedOffcutId === offcut.id;
                return (
                  <tr
                    key={offcut.id}
                    className={`transition-colors ${
                      isSelected ? 'bg-amber-50/70' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="py-2.5 px-6 font-medium text-slate-900 whitespace-nowrap">
                      Board {offcut.boardNumber}
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap text-slate-700">
                      <span className="inline-flex items-center gap-1.5 text-xs">
                        <span
                          aria-hidden="true"
                          className="w-2.5 h-2.5 rounded-xs border border-slate-400 shrink-0"
                          style={{backgroundColor: resolveColorHex(offcut.boardColor)}}
                        />
                        <span>{offcut.boardColor}</span>
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-800">
                      {offcut.length}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-800">
                      {offcut.width}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono tabular-nums font-semibold text-slate-900">
                      {offcut.areaM2.toFixed(3)} m²
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-500">
                      {offcut.areaMm2.toLocaleString()} mm²
                    </td>
                    <td className="py-2.5 px-6 text-right no-print">
                      <button
                        type="button"
                        onClick={() => onLocateOffcut(offcut)}
                        className="inline-flex items-center gap-1.5 h-8 px-2.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded transition-colors cursor-pointer"
                      >
                        <Crosshair className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Locate on Board</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
