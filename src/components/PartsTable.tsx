import React, {useMemo, useState} from 'react';
import {Copy, FileDown, RotateCcw, Search, Trash2} from 'lucide-react';
import {resolveColorHex} from '../data/presets';
import {
  CabinetPart,
  COMPONENT_TYPE_META,
  COMPONENT_TYPES,
  ComponentType,
  EdgeSides,
  GrainDirection,
  GrooveSides,
} from '../types/cabinet';

interface PartsTableProps {
  parts: CabinetPart[];
  onUpdatePart: (id: string, updates: Partial<CabinetPart>) => void;
  onDuplicatePart: (id: string) => void;
  onDeletePart: (id: string) => void;
  onClearAll: () => void;
  onResetSample: () => void;
  onExportPdf: () => void;
}

export const PartsTable: React.FC<PartsTableProps> = ({
  parts,
  onUpdatePart,
  onDuplicatePart,
  onDeletePart,
  onClearAll,
  onResetSample,
  onExportPdf,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | ComponentType>('All');

  const activeTypes = useMemo(() => {
    const set = new Set<ComponentType>();
    parts.forEach((p) => set.add(p.componentType));
    return COMPONENT_TYPES.filter((t) => set.has(t));
  }, [parts]);

  const filteredParts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return parts.filter((p) => {
      if (typeFilter !== 'All' && p.componentType !== typeFilter) return false;
      if (q) {
        return (
          p.partName.toLowerCase().includes(q) ||
          p.componentType.toLowerCase().includes(q) ||
          p.color.toLowerCase().includes(q) ||
          `${p.length}x${p.width}`.includes(q)
        );
      }
      return true;
    });
  }, [parts, searchQuery, typeFilter]);

  const totalPieces = useMemo(
    () => parts.reduce((sum, p) => sum + p.quantity, 0),
    [parts]
  );

  const toggleEdge = (part: CabinetPart, key: keyof EdgeSides) => {
    onUpdatePart(part.id, {
      edgeSides: {...part.edgeSides, [key]: !part.edgeSides[key]},
    });
  };

  const toggleGroove = (part: CabinetPart, key: keyof GrooveSides) => {
    onUpdatePart(part.id, {
      grooveSides: {...part.grooveSides, [key]: !part.grooveSides[key]},
    });
  };

  return (
    <section
      id="parts-list"
      aria-labelledby="parts-list-heading"
      className="bg-white border border-slate-200 rounded-lg"
    >
      <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 id="parts-list-heading" className="font-display text-base font-semibold text-slate-900">
            Parts List
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
            {parts.length} line {parts.length === 1 ? 'item' : 'items'} · {totalPieces} total pieces · Edit dimensions, cut color, edges (E1–E4), or grooves (G1–G4) inline
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {parts.length > 0 && (
            <button
              type="button"
              onClick={onExportPdf}
              className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-slate-900 bg-slate-100 border border-slate-300 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Export Cut List PDF</span>
            </button>
          )}
          <button
            type="button"
            onClick={onResetSample}
            className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition-colors whitespace-nowrap cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Load Sample</span>
          </button>
          {parts.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium text-red-700 bg-white border border-slate-300 hover:bg-red-50 hover:border-red-200 rounded-md transition-colors whitespace-nowrap cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      {parts.length > 0 && (
        <div className="px-6 py-3 bg-slate-50/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-0.5">
            <button
              type="button"
              onClick={() => setTypeFilter('All')}
              className={`h-8 px-3 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                typeFilter === 'All'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900'
              }`}
            >
              All ({parts.length})
            </button>
            {activeTypes.map((type) => {
              const count = parts.filter((p) => p.componentType === type).length;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setTypeFilter(type)}
                  className={`h-8 px-3 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    typeFilter === type
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900'
                  }`}
                >
                  {COMPONENT_TYPE_META[type].plural} ({count})
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-56">
            <Search
              className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter parts or colors..."
              aria-label="Filter parts list"
              className="w-full h-8 pl-8 pr-3 text-xs bg-white border border-slate-300 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>
      )}

      {/* Parts Table or Empty State */}
      {parts.length === 0 ? (
        <div className="p-12 text-center">
          <p className="font-display text-sm font-semibold text-slate-900">
            No cabinet components added yet
          </p>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Add individual pieces using the Component Entry panel above, enable the Smart Cabinet Assistant, or load the sample cabinet run.
          </p>
          <button
            type="button"
            onClick={onResetSample}
            className="mt-4 inline-flex items-center gap-2 h-9 px-4 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-md transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Load Sample Cabinet Run</span>
          </button>
        </div>
      ) : filteredParts.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500">
          No parts match the current filter.{' '}
          <button
            type="button"
            onClick={() => {
              setTypeFilter('All');
              setSearchQuery('');
            }}
            className="text-blue-700 font-medium hover:underline cursor-pointer"
          >
            Reset filter
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-600">
                <th className="py-2.5 px-4 whitespace-nowrap">Component Type</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Part Name</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Color</th>
                <th className="py-2.5 px-2 text-right whitespace-nowrap">Length (mm)</th>
                <th className="py-2.5 px-2 text-right whitespace-nowrap">Width (mm)</th>
                <th className="py-2.5 px-2 text-right whitespace-nowrap">Quantity</th>
                <th className="py-2.5 px-2 text-center whitespace-nowrap">Rotation</th>
                <th className="py-2.5 px-2 whitespace-nowrap">Grain Direction</th>
                <th className="py-2.5 px-2 text-center whitespace-nowrap">Edge (E1–E4)</th>
                <th className="py-2.5 px-2 text-center whitespace-nowrap">Groove (G1–G4)</th>
                <th className="py-2.5 px-4 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredParts.map((part) => {
                const meta = COMPONENT_TYPE_META[part.componentType];
                return (
                  <tr key={part.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          aria-hidden="true"
                          className="w-2.5 h-2.5 rounded-xs shrink-0 border"
                          style={{
                            backgroundColor: meta.cadFill,
                            borderColor: meta.cadStroke,
                          }}
                        />
                        <select
                          aria-label={`Component type for ${part.partName}`}
                          value={part.componentType}
                          onChange={(e) =>
                            onUpdatePart(part.id, {
                              componentType: e.target.value as ComponentType,
                            })
                          }
                          className="h-8 px-1.5 text-xs font-medium bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-600 focus:bg-white rounded text-slate-900 cursor-pointer focus:outline-none"
                        >
                          {COMPONENT_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>

                    <td className="py-2 px-3 min-w-[140px]">
                      <input
                        type="text"
                        aria-label={`Part name for ${part.componentType}`}
                        value={part.partName}
                        onChange={(e) => onUpdatePart(part.id, {partName: e.target.value})}
                        className="w-full h-8 px-2 text-xs bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-600 focus:bg-white rounded text-slate-800 focus:outline-none"
                      />
                    </td>

                    <td className="py-2 px-3 min-w-[125px]">
                      <div className="relative flex items-center">
                        <span
                          aria-hidden="true"
                          className="w-2.5 h-2.5 rounded-xs border border-slate-400 absolute left-2 pointer-events-none"
                          style={{backgroundColor: resolveColorHex(part.color)}}
                        />
                        <input
                          type="text"
                          list="entry-color-presets"
                          aria-label={`Color for ${part.partName}`}
                          value={part.color}
                          onChange={(e) => onUpdatePart(part.id, {color: e.target.value})}
                          className="w-full h-8 pl-6 pr-2 text-xs bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-600 focus:bg-white rounded text-slate-800 focus:outline-none"
                        />
                      </div>
                    </td>

                    <td className="py-2 px-2 text-right">
                      <input
                        type="number"
                        min={1}
                        step={0.5}
                        aria-label={`Length in mm for ${part.partName}`}
                        value={part.length}
                        onChange={(e) =>
                          onUpdatePart(part.id, {
                            length: Math.max(1, Number(e.target.value) || 1),
                          })
                        }
                        className="w-18 h-8 px-1.5 text-right text-xs font-mono tabular-nums bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-600 focus:bg-white rounded text-slate-900 focus:outline-none"
                      />
                    </td>

                    <td className="py-2 px-2 text-right">
                      <input
                        type="number"
                        min={1}
                        step={0.5}
                        aria-label={`Width in mm for ${part.partName}`}
                        value={part.width}
                        onChange={(e) =>
                          onUpdatePart(part.id, {
                            width: Math.max(1, Number(e.target.value) || 1),
                          })
                        }
                        className="w-18 h-8 px-1.5 text-right text-xs font-mono tabular-nums bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-600 focus:bg-white rounded text-slate-900 focus:outline-none"
                      />
                    </td>

                    <td className="py-2 px-2 text-right">
                      <input
                        type="number"
                        min={1}
                        step={1}
                        aria-label={`Quantity for ${part.partName}`}
                        value={part.quantity}
                        onChange={(e) =>
                          onUpdatePart(part.id, {
                            quantity: Math.max(1, Math.floor(Number(e.target.value) || 1)),
                          })
                        }
                        className="w-14 h-8 px-1.5 text-right text-xs font-mono tabular-nums font-semibold bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-600 focus:bg-white rounded text-slate-900 focus:outline-none"
                      />
                    </td>

                    <td className="py-2 px-2 text-center">
                      <input
                        type="checkbox"
                        aria-label={`Rotation allowed for ${part.partName}`}
                        checked={part.rotationAllowed}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          onUpdatePart(part.id, {
                            rotationAllowed: checked,
                            grainDirection:
                              checked && part.grainDirection !== 'None'
                                ? 'None'
                                : part.grainDirection,
                          });
                        }}
                        className="w-4 h-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600 cursor-pointer"
                      />
                    </td>

                    <td className="py-2 px-2 whitespace-nowrap">
                      <select
                        aria-label={`Grain direction for ${part.partName}`}
                        value={part.grainDirection}
                        onChange={(e) => {
                          const nextGrain = e.target.value as GrainDirection;
                          onUpdatePart(part.id, {
                            grainDirection: nextGrain,
                            rotationAllowed:
                              nextGrain !== 'None' ? false : part.rotationAllowed,
                          });
                        }}
                        className="h-8 px-1.5 text-xs bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-600 focus:bg-white rounded text-slate-700 cursor-pointer focus:outline-none"
                      >
                        <option value="None">None</option>
                        <option value="Along Length">Along Length</option>
                        <option value="Along Width">Along Width</option>
                      </select>
                    </td>

                    <td className="py-2 px-2 whitespace-nowrap text-center">
                      <div className="inline-flex items-center gap-0.5">
                        {(['e1', 'e2', 'e3', 'e4'] as const).map((k) => {
                          const active = part.edgeSides[k];
                          return (
                            <button
                              key={k}
                              type="button"
                              onClick={() => toggleEdge(part, k)}
                              title={`Toggle ${k.toUpperCase()} edge banding`}
                              className={`w-6 h-6 text-[10px] font-mono font-semibold rounded border transition-colors cursor-pointer ${
                                active
                                  ? 'bg-slate-900 text-white border-slate-900'
                                  : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400 hover:text-slate-700'
                              }`}
                            >
                              {active ? 'x' : k.slice(1)}
                            </button>
                          );
                        })}
                      </div>
                    </td>

                    <td className="py-2 px-2 whitespace-nowrap text-center">
                      <div className="inline-flex items-center gap-0.5">
                        {(['g1', 'g2', 'g3', 'g4'] as const).map((k) => {
                          const active = part.grooveSides[k];
                          return (
                            <button
                              key={k}
                              type="button"
                              onClick={() => toggleGroove(part, k)}
                              title={`Toggle ${k.toUpperCase()} groove`}
                              className={`w-6 h-6 text-[10px] font-mono font-semibold rounded border transition-colors cursor-pointer ${
                                active
                                  ? 'bg-blue-700 text-white border-blue-700'
                                  : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400 hover:text-slate-700'
                              }`}
                            >
                              {active ? 'x' : k.slice(1)}
                            </button>
                          );
                        })}
                      </div>
                    </td>

                    <td className="py-2 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onDuplicatePart(part.id)}
                          title="Duplicate row"
                          aria-label={`Duplicate ${part.partName}`}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeletePart(part.id)}
                          title="Delete row"
                          aria-label={`Delete ${part.partName}`}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>
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
