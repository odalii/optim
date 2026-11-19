import React, {useState} from 'react';
import {Plus} from 'lucide-react';
import {BOARD_COLOR_PRESETS, resolveColorHex} from '../data/presets';
import {
  CabinetPart,
  COMPONENT_TYPE_META,
  COMPONENT_TYPES,
  ComponentType,
  EdgeSides,
  GrainDirection,
  GrooveSides,
} from '../types/cabinet';

interface ComponentEntryFormProps {
  defaultColor: string;
  onAddPart: (part: Omit<CabinetPart, 'id'>) => void;
}

export const ComponentEntryForm: React.FC<ComponentEntryFormProps> = ({
  defaultColor,
  onAddPart,
}) => {
  const [componentType, setComponentType] = useState<ComponentType>('Side Panel');
  const [partName, setPartName] = useState<string>('');
  const [length, setLength] = useState<string>('720');
  const [width, setWidth] = useState<string>('560');
  const [quantity, setQuantity] = useState<string>('2');
  const [color, setColor] = useState<string>(defaultColor || 'Light Grey');
  const [rotationAllowed, setRotationAllowed] = useState<boolean>(
    COMPONENT_TYPE_META['Side Panel'].defaultRotation
  );
  const [grainDirection, setGrainDirection] = useState<GrainDirection>(
    COMPONENT_TYPE_META['Side Panel'].defaultGrain
  );
  const [edgeSides, setEdgeSides] = useState<EdgeSides>(
    COMPONENT_TYPE_META['Side Panel'].defaultEdgeSides
  );
  const [grooveSides, setGrooveSides] = useState<GrooveSides>(
    COMPONENT_TYPE_META['Side Panel'].defaultGrooveSides
  );
  const [error, setError] = useState<string | null>(null);

  const handleSelectType = (nextType: ComponentType) => {
    setComponentType(nextType);
    const meta = COMPONENT_TYPE_META[nextType];
    setRotationAllowed(meta.defaultRotation);
    setGrainDirection(meta.defaultGrain);
    setEdgeSides({...meta.defaultEdgeSides});
    setGrooveSides({...meta.defaultGrooveSides});
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numLength = Number(length);
    const numWidth = Number(width);
    const numQty = Math.floor(Number(quantity));

    if (!Number.isFinite(numLength) || numLength <= 0) {
      setError('Enter a valid length greater than 0 mm.');
      return;
    }
    if (!Number.isFinite(numWidth) || numWidth <= 0) {
      setError('Enter a valid width greater than 0 mm.');
      return;
    }
    if (!Number.isFinite(numQty) || numQty < 1) {
      setError('Enter a valid quantity of at least 1.');
      return;
    }

    const finalPartName = partName.trim() || componentType;
    const finalColor = color.trim() || defaultColor || 'Standard';

    onAddPart({
      componentType,
      partName: finalPartName,
      length: Math.round(numLength * 10) / 10,
      width: Math.round(numWidth * 10) / 10,
      quantity: numQty,
      color: finalColor,
      rotationAllowed,
      grainDirection,
      edgeSides: {...edgeSides},
      grooveSides: {...grooveSides},
    });

    setPartName('');
    setError(null);
  };

  return (
    <section
      aria-labelledby="component-entry-heading"
      className="bg-white border border-slate-200 rounded-lg p-6"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2 pb-4 border-b border-slate-200">
        <div>
          <h2 id="component-entry-heading" className="font-display text-base font-semibold text-slate-900">
            Component Entry
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select a cabinet component category first, then enter dimensions, quantity, board color, and edge/groove marks.
          </p>
        </div>
        <span className="text-xs text-slate-500">
          Selected tag: <strong className="font-semibold text-slate-900">{componentType}</strong>
        </span>
      </div>

      {/* Step 1: Predefined Component Type Grid */}
      <div className="pt-4">
        <span className="block text-xs font-medium text-slate-700 mb-2">
          1. Component Type
        </span>
        <div
          role="radiogroup"
          aria-label="Component Type"
          className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5"
        >
          {COMPONENT_TYPES.map((type) => {
            const isSelected = componentType === type;
            const meta = COMPONENT_TYPE_META[type];
            return (
              <button
                key={type}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => handleSelectType(type)}
                className={`h-10 px-2.5 text-left text-xs font-medium rounded-md border transition-colors flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span
                  aria-hidden="true"
                  className="w-2.5 h-2.5 rounded-xs shrink-0 border"
                  style={{
                    backgroundColor: meta.cadFill,
                    borderColor: meta.cadStroke,
                  }}
                />
                <span className="truncate">{meta.plural}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Dimensions, Color & Machining Properties */}
      <form onSubmit={handleSubmit} className="pt-5 mt-5 border-t border-slate-100 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
          <label className="lg:col-span-3 block">
            <span className="block text-xs font-medium text-slate-700 mb-1.5">
              Component Type
            </span>
            <select
              value={componentType}
              onChange={(e) => handleSelectType(e.target.value as ComponentType)}
              className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 cursor-pointer"
            >
              {COMPONENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label className="lg:col-span-3 block">
            <span className="block text-xs font-medium text-slate-700 mb-1.5">
              Part Name (Optional)
            </span>
            <input
              type="text"
              value={partName}
              onChange={(e) => setPartName(e.target.value)}
              placeholder={componentType}
              className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </label>

          <label className="lg:col-span-2 block">
            <span className="block text-xs font-medium text-slate-700 mb-1.5">
              Cut Color / Finish
            </span>
            <div className="relative flex items-center">
              <span
                aria-hidden="true"
                className="w-3.5 h-3.5 rounded-xs border border-slate-400 absolute left-3 pointer-events-none"
                style={{backgroundColor: resolveColorHex(color)}}
              />
              <input
                type="text"
                list="entry-color-presets"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="Light Grey"
                className="w-full h-10 pl-8 pr-3 text-sm bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>
            <datalist id="entry-color-presets">
              {BOARD_COLOR_PRESETS.map((c) => (
                <option key={c.name} value={c.name} />
              ))}
            </datalist>
          </label>

          <label className="lg:col-span-1.5 lg:col-span-2 block">
            <span className="block text-xs font-medium text-slate-700 mb-1.5">
              Length (mm)
            </span>
            <input
              type="number"
              min={1}
              step={0.5}
              value={length}
              onChange={(e) => setLength(e.target.value)}
              className="w-full h-10 px-3 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </label>

          <label className="lg:col-span-1 block">
            <span className="block text-xs font-medium text-slate-700 mb-1.5">
              Width
            </span>
            <input
              type="number"
              min={1}
              step={0.5}
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              className="w-full h-10 px-2.5 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </label>

          <label className="lg:col-span-1 block">
            <span className="block text-xs font-medium text-slate-700 mb-1.5">
              Qty
            </span>
            <input
              type="number"
              min={1}
              step={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full h-10 px-2.5 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          <div className="flex flex-wrap items-center gap-5">
            <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer min-h-[36px]">
              <input
                type="checkbox"
                checked={rotationAllowed}
                onChange={(e) => {
                  const next = e.target.checked;
                  setRotationAllowed(next);
                  if (next && grainDirection !== 'None') {
                    setGrainDirection('None');
                  }
                }}
                className="w-4 h-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600 cursor-pointer"
              />
              <span>Rotation Allowed</span>
            </label>

            <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700">
              <span className="whitespace-nowrap">Grain:</span>
              <select
                value={grainDirection}
                onChange={(e) => {
                  const nextGrain = e.target.value as GrainDirection;
                  setGrainDirection(nextGrain);
                  if (nextGrain !== 'None') {
                    setRotationAllowed(false);
                  }
                }}
                className="h-9 px-2.5 text-xs bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer"
              >
                <option value="None">None (Free)</option>
                <option value="Along Length">Along Length</option>
                <option value="Along Width">Along Width</option>
              </select>
            </label>

            <div className="inline-flex items-center gap-1.5">
              <span className="text-xs font-medium text-slate-600 mr-1">Edge:</span>
              {(['e1', 'e2', 'e3', 'e4'] as const).map((key) => {
                const active = edgeSides[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setEdgeSides((prev) => ({...prev, [key]: !prev[key]}))}
                    aria-pressed={active}
                    className={`h-8 w-8 text-[11px] font-mono font-semibold rounded border transition-colors cursor-pointer ${
                      active
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-500 border-slate-300 hover:text-slate-900'
                    }`}
                  >
                    {key.toUpperCase()}
                  </button>
                );
              })}
            </div>

            <div className="inline-flex items-center gap-1.5">
              <span className="text-xs font-medium text-slate-600 mr-1">Groove:</span>
              {(['g1', 'g2', 'g3', 'g4'] as const).map((key) => {
                const active = grooveSides[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setGrooveSides((prev) => ({...prev, [key]: !prev[key]}))}
                    aria-pressed={active}
                    className={`h-8 w-8 text-[11px] font-mono font-semibold rounded border transition-colors cursor-pointer ${
                      active
                        ? 'bg-blue-700 text-white border-blue-700'
                        : 'bg-white text-slate-500 border-slate-300 hover:text-slate-900'
                    }`}
                  >
                    {key.toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-2 h-10 px-5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Add Component</span>
          </button>
        </div>

        {error && (
          <p role="alert" className="text-xs font-medium text-red-700">
            {error}
          </p>
        )}
      </form>
    </section>
  );
};
