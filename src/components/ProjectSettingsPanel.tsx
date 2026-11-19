import React from 'react';
import {BOARD_COLOR_PRESETS, MATERIAL_PRESETS, resolveColorHex} from '../data/presets';
import {MaterialSettings, ProjectInfo} from '../types/cabinet';

interface ProjectSettingsPanelProps {
  projectInfo: ProjectInfo;
  materialSettings: MaterialSettings;
  onUpdateProjectInfo: (updates: Partial<ProjectInfo>) => void;
  onUpdateMaterial: (updates: Partial<MaterialSettings>) => void;
}

export const ProjectSettingsPanel: React.FC<ProjectSettingsPanelProps> = ({
  projectInfo,
  materialSettings,
  onUpdateProjectInfo,
  onUpdateMaterial,
}) => {
  const handlePresetChange = (presetName: string) => {
    const preset = MATERIAL_PRESETS.find((p) => p.materialName === presetName);
    if (preset) {
      onUpdateMaterial({
        materialName: preset.materialName,
        defaultColor: preset.defaultColor,
        sheetLength: preset.sheetLength,
        sheetWidth: preset.sheetWidth,
        thickness: preset.thickness,
      });
    }
  };

  return (
    <section
      id="workspace"
      aria-labelledby="workspace-heading"
      className="bg-white border border-slate-200 rounded-lg"
    >
      <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 id="workspace-heading" className="font-display text-lg font-semibold text-slate-900">
            Project Workspace
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Define project metadata, stock sheet dimensions, default board color, saw kerf, and trim allowances in millimeters.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono tabular-nums">
          <span>Units: mm</span>
          <span aria-hidden="true">·</span>
          <span>
            Usable Sheet:{' '}
            {Math.max(0, materialSettings.sheetLength - 2 * materialSettings.trimMargin)} ×{' '}
            {Math.max(0, materialSettings.sheetWidth - 2 * materialSettings.trimMargin)} mm
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
        {/* Project Information */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold text-slate-900">
              Project Information
            </h2>
            <span className="text-xs font-mono text-slate-500 tabular-nums">
              {projectInfo.jobReference || 'Unassigned'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="block text-xs font-medium text-slate-700 mb-1.5">
                Project Name
              </span>
              <input
                type="text"
                value={projectInfo.projectName}
                onChange={(e) => onUpdateProjectInfo({projectName: e.target.value})}
                placeholder="e.g. Wardrobes & Kitchen Run"
                className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </label>

            <label className="block">
              <span className="block text-xs font-medium text-slate-700 mb-1.5">
                Client / Workshop
              </span>
              <input
                type="text"
                value={projectInfo.clientName}
                onChange={(e) => onUpdateProjectInfo({clientName: e.target.value})}
                placeholder="e.g. Northside Joinery"
                className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </label>

            <label className="block">
              <span className="block text-xs font-medium text-slate-700 mb-1.5">
                Job Reference
              </span>
              <input
                type="text"
                value={projectInfo.jobReference}
                onChange={(e) => onUpdateProjectInfo({jobReference: e.target.value})}
                placeholder="JOB-2026-041"
                className="w-full h-10 px-3 text-sm font-mono bg-white border border-slate-300 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </label>

            <label className="block">
              <span className="block text-xs font-medium text-slate-700 mb-1.5">
                Production Notes
              </span>
              <input
                type="text"
                value={projectInfo.notes}
                onChange={(e) => onUpdateProjectInfo({notes: e.target.value})}
                placeholder="Edge banding or construction notes"
                className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </label>
          </div>
        </div>

        {/* Material Settings */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-sm font-semibold text-slate-900">
              Material Settings
            </h2>
            <div className="flex items-center gap-2">
              <label htmlFor="material-preset" className="text-xs text-slate-500 whitespace-nowrap">
                Preset:
              </label>
              <select
                id="material-preset"
                value=""
                onChange={(e) => handlePresetChange(e.target.value)}
                className="h-8 px-2.5 text-xs bg-slate-50 border border-slate-300 rounded-md text-slate-700 focus:outline-none focus:border-blue-600 cursor-pointer"
              >
                <option value="" disabled>
                  Load stock preset...
                </option>
                {MATERIAL_PRESETS.map((preset) => (
                  <option key={preset.materialName} value={preset.materialName}>
                    {preset.materialName} ({preset.sheetLength}×{preset.sheetWidth})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <label className="col-span-2 block">
              <span className="block text-xs font-medium text-slate-700 mb-1.5">
                Sheet Material Name
              </span>
              <input
                type="text"
                value={materialSettings.materialName}
                onChange={(e) => onUpdateMaterial({materialName: e.target.value})}
                placeholder="e.g. 18mm Plywood"
                className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </label>

            <label className="block">
              <span className="block text-xs font-medium text-slate-700 mb-1.5">
                Default Color / Finish
              </span>
              <div className="relative flex items-center">
                <span
                  aria-hidden="true"
                  className="w-3.5 h-3.5 rounded-xs border border-slate-400 absolute left-3 pointer-events-none"
                  style={{backgroundColor: resolveColorHex(materialSettings.defaultColor)}}
                />
                <input
                  type="text"
                  list="board-color-presets"
                  value={materialSettings.defaultColor}
                  onChange={(e) => onUpdateMaterial({defaultColor: e.target.value})}
                  placeholder="Light Grey"
                  className="w-full h-10 pl-8 pr-3 text-sm bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <datalist id="board-color-presets">
                {BOARD_COLOR_PRESETS.map((c) => (
                  <option key={c.name} value={c.name} />
                ))}
              </datalist>
            </label>

            <label className="block">
              <span className="block text-xs font-medium text-slate-700 mb-1.5">
                Sheet Length (mm)
              </span>
              <input
                type="number"
                min={300}
                max={6000}
                step={1}
                value={materialSettings.sheetLength}
                onChange={(e) =>
                  onUpdateMaterial({sheetLength: Math.max(100, Number(e.target.value) || 0)})
                }
                className="w-full h-10 px-3 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </label>

            <label className="block">
              <span className="block text-xs font-medium text-slate-700 mb-1.5">
                Sheet Width (mm)
              </span>
              <input
                type="number"
                min={300}
                max={4000}
                step={1}
                value={materialSettings.sheetWidth}
                onChange={(e) =>
                  onUpdateMaterial({sheetWidth: Math.max(100, Number(e.target.value) || 0)})
                }
                className="w-full h-10 px-3 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </label>

            <label className="block">
              <span className="block text-xs font-medium text-slate-700 mb-1.5">
                Thickness (mm)
              </span>
              <input
                type="number"
                min={3}
                max={60}
                step={0.5}
                value={materialSettings.thickness}
                onChange={(e) =>
                  onUpdateMaterial({thickness: Math.max(1, Number(e.target.value) || 0)})
                }
                className="w-full h-10 px-3 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </label>

            <label className="block">
              <span className="block text-xs font-medium text-slate-700 mb-1.5">
                Saw Kerf (mm)
              </span>
              <input
                type="number"
                min={0}
                max={15}
                step={0.1}
                value={materialSettings.kerf}
                onChange={(e) =>
                  onUpdateMaterial({kerf: Math.max(0, Number(e.target.value) || 0)})
                }
                className="w-full h-10 px-3 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </label>

            <label className="block">
              <span className="block text-xs font-medium text-slate-700 mb-1.5">
                Edge Trim (mm)
              </span>
              <input
                type="number"
                min={0}
                max={50}
                step={1}
                value={materialSettings.trimMargin}
                onChange={(e) =>
                  onUpdateMaterial({trimMargin: Math.max(0, Number(e.target.value) || 0)})
                }
                className="w-full h-10 px-3 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </label>
          </div>
        </div>
      </div>
    </section>
  );
};
