import React from 'react';
import {
  BoardResult,
  COMPONENT_TYPE_META,
  ComponentType,
} from '../types/cabinet';

interface BoardDiagramProps {
  board: BoardResult;
  highlightedComponentType: ComponentType | null;
  highlightedPartId: string | null;
  highlightedOffcutId: string | null;
  onHoverPart: (instanceId: string | null) => void;
}

export const BoardDiagram: React.FC<BoardDiagramProps> = ({
  board,
  highlightedComponentType,
  highlightedPartId,
  highlightedOffcutId,
  onHoverPart,
}) => {
  const {sheetLength, sheetWidth, placedParts, offcuts} = board;
  const pad = 28;
  const viewWidth = sheetLength + pad * 2;
  const viewHeight = sheetWidth + pad * 2;

  return (
    <div className="w-full bg-slate-50 border border-slate-200 rounded-md p-3">
      <svg
        viewBox={`0 0 ${viewWidth} ${viewHeight}`}
        role="img"
        aria-label={`Board ${board.boardNumber} cutting layout (${sheetLength} by ${sheetWidth} millimeters)`}
        className="w-full h-auto block select-none"
      >
        <defs>
          <pattern
            id={`offcut-hatch-${board.boardNumber}`}
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="24"
              stroke="#CBD5E1"
              strokeWidth="2"
            />
          </pattern>
        </defs>

        {/* Sheet Dimensions Header */}
        <text
          x={pad + sheetLength / 2}
          y={18}
          textAnchor="middle"
          fill="#475569"
          fontSize={Math.max(24, sheetLength * 0.015)}
          fontFamily="JetBrains Mono, monospace"
        >
          {sheetLength} mm
        </text>
        <text
          x={14}
          y={pad + sheetWidth / 2}
          textAnchor="middle"
          fill="#475569"
          fontSize={Math.max(24, sheetLength * 0.015)}
          fontFamily="JetBrains Mono, monospace"
          transform={`rotate(-90 14 ${pad + sheetWidth / 2})`}
        >
          {sheetWidth} mm
        </text>

        {/* Stock Sheet Outline */}
        <rect
          x={pad}
          y={pad}
          width={sheetLength}
          height={sheetWidth}
          fill="#FFFFFF"
          stroke="#0F172A"
          strokeWidth={3}
        />

        {/* Offcut Rectangles */}
        {offcuts.map((offcut) => {
          const isHighlighted = highlightedOffcutId === offcut.id;
          const showOffcutLabel = offcut.length >= 160 && offcut.width >= 90;
          return (
            <g key={offcut.id}>
              <rect
                x={pad + offcut.x}
                y={pad + offcut.y}
                width={offcut.length}
                height={offcut.width}
                fill={
                  isHighlighted
                    ? 'rgba(217, 119, 6, 0.22)'
                    : `url(#offcut-hatch-${board.boardNumber})`
                }
                stroke={isHighlighted ? '#D97706' : '#CBD5E1'}
                strokeWidth={isHighlighted ? 4 : 1.5}
                strokeDasharray={isHighlighted ? undefined : '8 6'}
              />
              {showOffcutLabel && (
                <text
                  x={pad + offcut.x + offcut.length / 2}
                  y={pad + offcut.y + offcut.width / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={isHighlighted ? '#92400E' : '#64748B'}
                  fontSize={Math.min(34, Math.max(18, offcut.width * 0.16))}
                  fontFamily="JetBrains Mono, monospace"
                >
                  {offcut.length}×{offcut.width}
                </text>
              )}
            </g>
          );
        })}

        {/* Placed Cabinet Parts */}
        {placedParts.map((part) => {
          const meta = COMPONENT_TYPE_META[part.componentType];
          const isTypeMatch =
            highlightedComponentType !== null &&
            highlightedComponentType === part.componentType;
          const isPartMatch = highlightedPartId === part.instanceId;
          const dimmed =
            (highlightedComponentType !== null && !isTypeMatch) ||
            (highlightedPartId !== null && !isPartMatch);

          const minDim = Math.min(part.placedLength, part.placedWidth);
          const fontSize = Math.min(34, Math.max(18, minDim * 0.12));
          const smallFontSize = Math.min(26, Math.max(14, minDim * 0.095));
          const showTwoLines = part.placedWidth >= 140 && part.placedLength >= 180;
          const showSingleLine = !showTwoLines && part.placedWidth >= 70 && part.placedLength >= 110;

          return (
            <g
              key={part.instanceId}
              onMouseEnter={() => onHoverPart(part.instanceId)}
              onMouseLeave={() => onHoverPart(null)}
              style={{opacity: dimmed ? 0.35 : 1, transition: 'opacity 150ms ease'}}
              className="cursor-pointer"
            >
              <rect
                x={pad + part.x}
                y={pad + part.y}
                width={part.placedLength}
                height={part.placedWidth}
                fill={meta.cadFill}
                stroke={isPartMatch || isTypeMatch ? '#1D4ED8' : meta.cadStroke}
                strokeWidth={isPartMatch || isTypeMatch ? 5 : 2.5}
              />

              {showTwoLines && (
                <>
                  <text
                    x={pad + part.x + part.placedLength / 2}
                    y={pad + part.y + part.placedWidth / 2 - fontSize * 0.55}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={meta.cadText}
                    fontSize={fontSize}
                    fontWeight="600"
                    fontFamily="DM Sans, sans-serif"
                  >
                    {part.componentType}
                  </text>
                  <text
                    x={pad + part.x + part.placedLength / 2}
                    y={pad + part.y + part.placedWidth / 2 + smallFontSize * 0.7}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={meta.cadText}
                    fontSize={smallFontSize}
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {part.placedLength} × {part.placedWidth}
                    {part.rotated ? ' ↻' : ''}
                  </text>
                </>
              )}

              {showSingleLine && (
                <text
                  x={pad + part.x + part.placedLength / 2}
                  y={pad + part.y + part.placedWidth / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={meta.cadText}
                  fontSize={smallFontSize}
                  fontWeight="600"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {meta.shortCode} {part.placedLength}×{part.placedWidth}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
