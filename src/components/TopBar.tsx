import React from 'react';
import {Play} from 'lucide-react';

interface TopBarProps {
  onGenerateOptimization: () => void;
  hasParts: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({onGenerateOptimization, hasParts}) => {
  return (
    <header className="no-print sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Title */}
        <a
          href="#workspace"
          className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
        >
          KerfPlan
        </a>

        {/* Zone 2: Concise single-line navigation links */}
        <nav
          aria-label="Workspace sections"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600"
        >
          <a
            href="#workspace"
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Workspace
          </a>
          <a
            href="#cabinet-assistant"
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Cabinet Assistant
          </a>
          <a
            href="#parts-list"
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Parts List
          </a>
          <a
            href="#optimization-results"
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Optimization
          </a>
          <a
            href="#offcuts"
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Offcuts
          </a>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={onGenerateOptimization}
            disabled={!hasParts}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 disabled:text-slate-500 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
            <span>Generate Optimization</span>
          </button>
        </div>
      </div>
    </header>
  );
};
