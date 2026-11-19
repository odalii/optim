import React, {useMemo, useState} from 'react';
import {ChevronDown, ChevronUp, Layers, PlusCircle} from 'lucide-react';
import {BOARD_COLOR_PRESETS, CABINET_TYPE_DEFAULTS, resolveColorHex} from '../data/presets';
import {CABINET_TYPES, CabinetPart, CabinetSpec, CabinetType} from '../types/cabinet';
import {generateCabinetParts} from '../utils/cabinetGenerator';

interface SmartCabinetAssistantProps {
  defaultThickness: number;
  defaultColor: string;
  onAddGeneratedParts: (parts: CabinetPart[]) => void;
}

export const SmartCabinetAssistant: React.FC<SmartCabinetAssistantProps> = ({
  defaultThickness,
  defaultColor,
  onAddGeneratedParts,
}) => {
  const [enabled, setEnabled] = useState<boolean>(false);
  const [spec, setSpec] = useState<CabinetSpec>({
    ...CABINET_TYPE_DEFAULTS['Base Cabinet'],
    cabinetLabel: 'Base Cab #1',
    boardThickness: defaultThickness || 18,
    carcassColor: defaultColor || 'Light Grey',
    frontColor: 'Summer Oak',
  });
  const [addedFeedback, setAddedFeedback] = useState<string | null>(null);

  const handleCabinetTypeChange = (type: CabinetType) => {
    const preset = CABINET_TYPE_DEFAULTS[type];
    setSpec((prev) => ({
      ...preset,
      cabinetLabel: type,
      boardThickness: prev.boardThickness || defaultThickness || 18,
      carcassColor: prev.carcassColor || defaultColor || 'Light Grey',
      frontColor: prev.frontColor || 'Summer Oak',
    }));
    setAddedFeedback(null);
  };

  const previewParts = useMemo(() => generateCabinetParts(spec), [spec]);
  const totalPreviewPieces = useMemo(
    () => previewParts.reduce((sum, p) => sum + p.quantity, 0),
    [previewParts]
  );

  const handleCommitParts = () => {
    const freshParts = generateCabinetParts(spec);
    onAddGeneratedParts(freshParts);
    setAddedFeedback(
      `Added ${totalPreviewPieces} pieces from "${spec.cabinetLabel || spec.cabinetType}" to the Parts List.`
    );
  };

  return (
    <section
      id="cabinet-assistant"
      aria-labelledby="assistant-heading"
      className="bg-white border border-slate-200 rounded-lg"
    >
      <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 text-slate-700">
            <Layers className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h2 id="assistant-heading" className="font-display text-base font-semibold text-slate-900">
              Smart Cabinet Assistant
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Optional cabinet builder mode. Choose a cabinet type, dimensions, and carcass/front colors to auto-generate standard parts.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setEnabled((v) => !v)}
          aria-expanded={enabled}
          className={`inline-flex items-center gap-2 h-10 px-4 text-sm font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
            enabled
              ? 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'
              : 'bg-slate-50 text-slate-800 border-slate-300 hover:bg-slate-100'
          }`}
        >
          <span>{enabled ? 'Hide Cabinet Builder' : 'Enable Cabinet Builder'}</span>
          {enabled ? (
            <ChevronUp className="w-4 h-4" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-4 h-4" aria-hidden="true" />
          )}
        </button>
      </div>

      {enabled && (
        <div className="border-t border-slate-200 p-6 space-y-6">
          {/* Step 1: Cabinet Type Selection */}
          <div>
            <span className="block text-xs font-medium text-slate-700 mb-2">
              1. Cabinet Type
            </span>
            <div
              role="radiogroup"
              aria-label="Cabinet Type"
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2"
            >
              {CABINET_TYPES.map((cabType) => {
                const active = spec.cabinetType === cabType;
                return (
                  <button
                    key={cabType}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => handleCabinetTypeChange(cabType)}
                    className={`h-10 px-3 text-xs font-medium rounded-md border text-center transition-colors whitespace-nowrap truncate cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                      active
                        ? 'bg-blue-700 text-white border-blue-700'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {cabType}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Cabinet Parameters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            <label className="col-span-2 block">
              <span className="block text-xs font-medium text-slate-700 mb-1.5">
                Cabinet Label
              </span>
              <input
                type="text"
                value={spec.cabinetLabel}
                onChange={(e) => setSpec((s) => ({...s, cabinetLabel: e.target.value}))}
                placeholder={spec.cabinetType}
                className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </label>

            <label className="block">
              <span className="block text-xs font-medium text-slate-700 mb-1.5">
                Height (mm)
              </span>
              <input
                type="number"
                min={100}
                max={3000}
                value={spec.height}
                onChange={(e) =>
                  setSpec((s) => ({...s, height: Math.max(100, Number(e.target.value) || 0)}))
                }
                className="w-full h-10 px-3 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </label>

            <label className="block">
              <span className="block text-xs font-medium text-slate-700 mb-1.5">
                Width (mm)
              </span>
              <input
                type="number"
                min={150}
                max={3000}
                value={spec.width}
                onChange={(e) =>
                  setSpec((s) => ({...s, width: Math.max(150, Number(e.target.value) || 0)}))
                }
                className="w-full h-10 px-3 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </label>

            <label className="block">
              <span className="block text-xs font-medium text-slate-700 mb-1.5">
                Depth (mm)
              </span>
              <input
                type="number"
                min={120}
                max={1200}
                value={spec.depth}
                onChange={(e) =>
                  setSpec((s) => ({...s, depth: Math.max(120, Number(e.target.value) || 0)}))
                }
                className="w-full h-10 px-3 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </label>

            <label className="block">
              <span className="block text-xs font-medium text-slate-700 mb-1.5">
                Shelves
              </span>
              <input
                type="number"
                min={0}
                max={12}
                value={spec.shelves}
                onChange={(e) =>
                  setSpec((s) => ({...s, shelves: Math.max(0, Math.floor(Number(e.target.value) || 0))}))
                }
                className="w-full h-10 px-3 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </label>

            <label className="block">
              <span className="block text-xs font-medium text-slate-700 mb-1.5">
                Doors
              </span>
              <input
                type="number"
                min={0}
                max={6}
                value={spec.doors}
                onChange={(e) =>
                  setSpec((s) => ({...s, doors: Math.max(0, Math.floor(Number(e.target.value) || 0))}))
                }
                className="w-full h-10 px-3 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </label>

            <label className="block">
              <span className="block text-xs font-medium text-slate-700 mb-1.5">
                Drawers
              </span>
              <input
                type="number"
                min={0}
                max={10}
                value={spec.drawers}
                onChange={(e) =>
                  setSpec((s) => ({...s, drawers: Math.max(0, Math.floor(Number(e.target.value) || 0))}))
                }
                className="w-full h-10 px-3 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </label>
          </div>

          {/* Carcass & Front Colors + Board thickness & Toe Kick options */}
          <div className="flex flex-wrap items-center gap-6 pt-1">
            <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700">
              <span>Carcass Color:</span>
              <div className="relative flex items-center">
                <span
                  aria-hidden="true"
                  className="w-3 h-3 rounded-xs border border-slate-400 absolute left-2.5 pointer-events-none"
                  style={{backgroundColor: resolveColorHex(spec.carcassColor)}}
                />
                <input
                  type="text"
                  list="assistant-color-presets"
                  value={spec.carcassColor}
                  onChange={(e) => setSpec((s) => ({...s, carcassColor: e.target.value}))}
                  className="w-36 h-9 pl-7 pr-2.5 text-xs bg-white border border-slate-300 rounded-md text-slate-900"
                />
              </div>
            </label>

            <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700">
              <span>Door / Front Color:</span>
              <div className="relative flex items-center">
                <span
                  aria-hidden="true"
                  className="w-3 h-3 rounded-xs border border-slate-400 absolute left-2.5 pointer-events-none"
                  style={{backgroundColor: resolveColorHex(spec.frontColor)}}
                />
                <input
                  type="text"
                  list="assistant-color-presets"
                  value={spec.frontColor}
                  onChange={(e) => setSpec((s) => ({...s, frontColor: e.target.value}))}
                  className="w-36 h-9 pl-7 pr-2.5 text-xs bg-white border border-slate-300 rounded-md text-slate-900"
                />
              </div>
            </label>

            <datalist id="assistant-color-presets">
              {BOARD_COLOR_PRESETS.map((c) => (
                <option key={c.name} value={c.name} />
              ))}
            </datalist>

            <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700">
              <span>Thickness (mm):</span>
              <input
                type="number"
                min={6}
                max={40}
                step={0.5}
                value={spec.boardThickness}
                onChange={(e) =>
                  setSpec((s) => ({
                    ...s,
                    boardThickness: Math.max(6, Number(e.target.value) || 18),
                  }))
                }
                className="w-20 h-9 px-2.5 text-xs font-mono tabular-nums bg-white border border-slate-300 rounded-md text-slate-900"
              />
            </label>

            <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer min-h-[36px]">
              <input
                type="checkbox"
                checked={spec.includeToeKick}
                onChange={(e) =>
                  setSpec((s) => ({
                    ...s,
                    includeToeKick: e.target.checked,
                    toeKickHeight: e.target.checked ? s.toeKickHeight || 100 : 0,
                  }))
                }
                className="w-4 h-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
              />
              <span>Toe Kick</span>
            </label>

            {spec.includeToeKick && (
              <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700">
                <span>Kick Height (mm):</span>
                <input
                  type="number"
                  min={40}
                  max={250}
                  value={spec.toeKickHeight}
                  onChange={(e) =>
                    setSpec((s) => ({
                      ...s,
                      toeKickHeight: Math.max(40, Number(e.target.value) || 100),
                    }))
                  }
                  className="w-20 h-9 px-2.5 text-xs font-mono tabular-nums bg-white border border-slate-300 rounded-md text-slate-900"
                />
              </label>
            )}
          </div>

          {/* Generated Parts Preview */}
          <div className="border border-slate-200 rounded-md overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-800">
                Generated Parts Preview ({totalPreviewPieces} total pieces)
              </span>
              <span className="text-xs text-slate-500 font-mono tabular-nums">
                {spec.height}H × {spec.width}W × {spec.depth}D mm · {spec.boardThickness}mm board
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 bg-white">
                    <th className="py-2 px-4 font-medium">Component Type</th>
                    <th className="py-2 px-4 font-medium">Part Name</th>
                    <th className="py-2 px-4 font-medium">Color</th>
                    <th className="py-2 px-4 font-medium text-right">Length (mm)</th>
                    <th className="py-2 px-4 font-medium text-right">Width (mm)</th>
                    <th className="py-2 px-4 font-medium text-right">Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {previewParts.map((part) => (
                    <tr key={part.id} className="hover:bg-slate-50/70">
                      <td className="py-2 px-4 font-medium text-slate-900">{part.componentType}</td>
                      <td className="py-2 px-4 text-slate-600">{part.partName}</td>
                      <td className="py-2 px-4 text-slate-700">
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            aria-hidden="true"
                            className="w-2.5 h-2.5 rounded-xs border border-slate-400 shrink-0"
                            style={{backgroundColor: resolveColorHex(part.color)}}
                          />
                          <span>{part.color}</span>
                        </span>
                      </td>
                      <td className="py-2 px-4 text-right font-mono tabular-nums text-slate-800">
                        {part.length}
                      </td>
                      <td className="py-2 px-4 text-right font-mono tabular-nums text-slate-800">
                        {part.width}
                      </td>
                      <td className="py-2 px-4 text-right font-mono tabular-nums font-semibold text-slate-900">
                        {part.quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-slate-600">
              {addedFeedback || 'Generated parts will be appended to the Parts List where you can edit every dimension, color, or edge before optimization.'}
            </p>
            <button
              type="button"
              onClick={handleCommitParts}
              className="inline-flex items-center gap-2 h-10 px-5 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              <PlusCircle className="w-4 h-4" aria-hidden="true" />
              <span>Add {totalPreviewPieces} Generated Parts to List</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
