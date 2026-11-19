import {useCallback, useEffect, useState} from 'react';
import {ComponentEntryForm} from './components/ComponentEntryForm';
import {OffcutsTable} from './components/OffcutsTable';
import {OptimizationResults} from './components/OptimizationResults';
import {PartsTable} from './components/PartsTable';
import {ProjectSettingsPanel} from './components/ProjectSettingsPanel';
import {ProjectSummary} from './components/ProjectSummary';
import {SmartCabinetAssistant} from './components/SmartCabinetAssistant';
import {TopBar} from './components/TopBar';
import {
  DEFAULT_MATERIAL_SETTINGS,
  DEFAULT_PROJECT_INFO,
  INITIAL_PARTS,
} from './data/presets';
import {
  CabinetPart,
  COMPONENT_TYPE_META,
  EMPTY_EDGES,
  EMPTY_GROOVES,
  MaterialSettings,
  OffcutRect,
  OptimizationResult,
  ProjectInfo,
} from './types/cabinet';
import {runCutOptimization} from './utils/cutOptimizer';
import {generateCutListPdf} from './utils/pdfGenerator';

const STORAGE_KEY = 'kerfplan_workspace_v2';

interface SavedWorkspace {
  projectInfo: ProjectInfo;
  materialSettings: MaterialSettings;
  parts: CabinetPart[];
}

function normalizePart(part: Partial<CabinetPart>, defaultColor: string): CabinetPart {
  const type = part.componentType || 'Custom Piece';
  const meta = COMPONENT_TYPE_META[type];
  return {
    id: part.id || `part-${Math.random().toString(36).slice(2, 8)}`,
    componentType: type,
    partName: part.partName || type,
    length: Number(part.length) || 500,
    width: Number(part.width) || 300,
    quantity: Math.max(1, Math.floor(Number(part.quantity) || 1)),
    color: part.color?.trim() || defaultColor,
    rotationAllowed: part.rotationAllowed ?? meta.defaultRotation,
    grainDirection: part.grainDirection ?? meta.defaultGrain,
    edgeSides: part.edgeSides ? {...EMPTY_EDGES, ...part.edgeSides} : {...meta.defaultEdgeSides},
    grooveSides: part.grooveSides
      ? {...EMPTY_GROOVES, ...part.grooveSides}
      : {...meta.defaultGrooveSides},
    sourceCabinet: part.sourceCabinet,
  };
}

function loadSavedWorkspace(): SavedWorkspace {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SavedWorkspace>;
      if (parsed.projectInfo && parsed.materialSettings && Array.isArray(parsed.parts)) {
        const materialSettings: MaterialSettings = {
          ...DEFAULT_MATERIAL_SETTINGS,
          ...parsed.materialSettings,
        };
        return {
          projectInfo: {...DEFAULT_PROJECT_INFO, ...parsed.projectInfo},
          materialSettings,
          parts: parsed.parts.map((p) => normalizePart(p, materialSettings.defaultColor)),
        };
      }
    }
  } catch {
    // Fall back to default workspace
  }
  return {
    projectInfo: DEFAULT_PROJECT_INFO,
    materialSettings: DEFAULT_MATERIAL_SETTINGS,
    parts: INITIAL_PARTS,
  };
}

export default function App() {
  const [initial] = useState<SavedWorkspace>(() => loadSavedWorkspace());
  const [projectInfo, setProjectInfo] = useState<ProjectInfo>(initial.projectInfo);
  const [materialSettings, setMaterialSettings] = useState<MaterialSettings>(
    initial.materialSettings
  );
  const [parts, setParts] = useState<CabinetPart[]>(initial.parts);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(() =>
    initial.parts.length > 0
      ? runCutOptimization(initial.parts, initial.materialSettings)
      : null
  );
  const [isStale, setIsStale] = useState<boolean>(false);
  const [highlightedOffcutId, setHighlightedOffcutId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const payload: SavedWorkspace = {projectInfo, materialSettings, parts};
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota errors
    }
  }, [projectInfo, materialSettings, parts]);

  const handleUpdateProjectInfo = useCallback((updates: Partial<ProjectInfo>) => {
    setProjectInfo((prev) => ({...prev, ...updates}));
  }, []);

  const handleUpdateMaterial = useCallback((updates: Partial<MaterialSettings>) => {
    setMaterialSettings((prev) => ({...prev, ...updates}));
    setIsStale(true);
  }, []);

  const handleAddPart = useCallback((partData: Omit<CabinetPart, 'id'>) => {
    const newPart: CabinetPart = {
      ...partData,
      id: `part-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    };
    setParts((prev) => [...prev, newPart]);
    setIsStale(true);
  }, []);

  const handleAddGeneratedParts = useCallback((generated: CabinetPart[]) => {
    setParts((prev) => [...prev, ...generated]);
    setIsStale(true);
  }, []);

  const handleUpdatePart = useCallback((id: string, updates: Partial<CabinetPart>) => {
    setParts((prev) => prev.map((p) => (p.id === id ? {...p, ...updates} : p)));
    setIsStale(true);
  }, []);

  const handleDuplicatePart = useCallback((id: string) => {
    setParts((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      if (idx === -1) return prev;
      const source = prev[idx];
      const copy: CabinetPart = {
        ...source,
        id: `part-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        partName: `${source.partName} (Copy)`,
        edgeSides: {...source.edgeSides},
        grooveSides: {...source.grooveSides},
      };
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
    setIsStale(true);
  }, []);

  const handleDeletePart = useCallback((id: string) => {
    setParts((prev) => prev.filter((p) => p.id !== id));
    setIsStale(true);
  }, []);

  const handleClearAll = useCallback(() => {
    setParts([]);
    setOptimizationResult(null);
    setIsStale(false);
    setHighlightedOffcutId(null);
  }, []);

  const handleResetSample = useCallback(() => {
    setProjectInfo(DEFAULT_PROJECT_INFO);
    setMaterialSettings(DEFAULT_MATERIAL_SETTINGS);
    setParts(INITIAL_PARTS);
    setOptimizationResult(runCutOptimization(INITIAL_PARTS, DEFAULT_MATERIAL_SETTINGS));
    setIsStale(false);
    setHighlightedOffcutId(null);
  }, []);

  const handleGenerateOptimization = useCallback(() => {
    if (parts.length === 0) return;
    const nextResult = runCutOptimization(parts, materialSettings);
    setOptimizationResult(nextResult);
    setIsStale(false);
    setHighlightedOffcutId(null);

    requestAnimationFrame(() => {
      const el = document.getElementById('optimization-results');
      if (el) {
        el.scrollIntoView({behavior: 'smooth', block: 'start'});
      }
    });
  }, [parts, materialSettings]);

  const handleExportPdf = useCallback(() => {
    if (parts.length === 0) return;
    let activeOptimization = optimizationResult;
    if (!activeOptimization || isStale) {
      activeOptimization = runCutOptimization(parts, materialSettings);
      setOptimizationResult(activeOptimization);
      setIsStale(false);
    }
    generateCutListPdf({
      projectInfo,
      material: materialSettings,
      parts,
      optimization: activeOptimization,
    });
  }, [parts, materialSettings, optimizationResult, isStale, projectInfo]);

  const handleLocateOffcut = useCallback((offcut: OffcutRect) => {
    setHighlightedOffcutId(offcut.id);
    const boardEl = document.getElementById(`board-${offcut.boardNumber}`);
    if (boardEl) {
      boardEl.scrollIntoView({behavior: 'smooth', block: 'center'});
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <TopBar
        onGenerateOptimization={handleGenerateOptimization}
        hasParts={parts.some((p) => p.quantity > 0)}
      />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-6 py-8 space-y-8">
        {/* Top Workspace Grid: Main Inputs (Left) + Project Summary Rail (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            <ProjectSettingsPanel
              projectInfo={projectInfo}
              materialSettings={materialSettings}
              onUpdateProjectInfo={handleUpdateProjectInfo}
              onUpdateMaterial={handleUpdateMaterial}
            />

            <ComponentEntryForm
              defaultColor={materialSettings.defaultColor}
              onAddPart={handleAddPart}
            />

            <SmartCabinetAssistant
              defaultThickness={materialSettings.thickness}
              defaultColor={materialSettings.defaultColor}
              onAddGeneratedParts={handleAddGeneratedParts}
            />

            <PartsTable
              parts={parts}
              onUpdatePart={handleUpdatePart}
              onDuplicatePart={handleDuplicatePart}
              onDeletePart={handleDeletePart}
              onClearAll={handleClearAll}
              onResetSample={handleResetSample}
              onExportPdf={handleExportPdf}
            />
          </div>

          <div className="lg:col-span-4 xl:col-span-3">
            <ProjectSummary
              parts={parts}
              material={materialSettings}
              onGenerateOptimization={handleGenerateOptimization}
              onExportPdf={handleExportPdf}
              isStale={isStale}
            />
          </div>
        </div>

        {/* Optimization Results & Offcuts */}
        <div className="pt-2 border-t border-slate-200 space-y-8">
          <OptimizationResults
            result={optimizationResult}
            material={materialSettings}
            projectInfo={projectInfo}
            highlightedOffcutId={highlightedOffcutId}
            onClearOffcutHighlight={() => setHighlightedOffcutId(null)}
            onExportPdf={handleExportPdf}
          />

          <OffcutsTable
            offcuts={optimizationResult?.allOffcuts ?? []}
            highlightedOffcutId={highlightedOffcutId}
            onLocateOffcut={handleLocateOffcut}
          />
        </div>
      </main>

      <footer className="no-print border-t border-slate-200 bg-white mt-12">
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <span>KerfPlan · Cabinet Component & Sheet Cutting Optimization</span>
          <span>All dimensions in millimeters (mm)</span>
        </div>
      </footer>
    </div>
  );
}
