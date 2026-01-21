
import React from 'react';
import { StrategicFactors } from '../types';

interface StrategicRadarChartProps {
  factors: StrategicFactors;
  size?: number;
}

export default function StrategicRadarChart({ factors, size = 240 }: StrategicRadarChartProps): React.ReactNode {
  const center = size / 2;
  const radius = (size / 2) * 0.7;

  // Map factors to array for easier iteration
  const data = [
    { label: 'Evidence', value: factors.evidence },
    { label: 'Procedural', value: factors.procedural },
    { label: 'Jurisdictional', value: factors.jurisdictional },
    { label: 'Resource', value: factors.resource },
    { label: 'Vulnerability', value: factors.opponentVulnerability },
  ];

  const numPoints = data.length;
  const angleStep = (Math.PI * 2) / numPoints;

  // Calculate grid rings
  const rings = [0.2, 0.4, 0.6, 0.8, 1.0];

  const getPoint = (value: number, angle: number) => {
    const r = (value / 10) * radius;
    const x = center + r * Math.cos(angle - Math.PI / 2);
    const y = center + r * Math.sin(angle - Math.PI / 2);
    return { x, y };
  };

  const polyPoints = data
    .map((d, i) => {
      const p = getPoint(d.value, i * angleStep);
      return `${p.x},${p.y}`;
    })
    .join(' ');

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="overflow-visible">
        {/* Grid Rings */}
        {rings.map((r, i) => (
          <polygon
            key={i}
            points={data.map((_, idx) => {
              const p = getPoint(r * 10, idx * angleStep);
              return `${p.x},${p.y}`;
            }).join(' ')}
            fill="none"
            stroke="rgba(59, 130, 246, 0.1)"
            strokeWidth="1"
          />
        ))}

        {/* Axis Lines */}
        {data.map((_, i) => {
          const p = getPoint(10, i * angleStep);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={p.x}
              y2={p.y}
              stroke="rgba(59, 130, 246, 0.2)"
              strokeWidth="1"
              strokeDasharray="4,4"
            />
          );
        })}

        {/* Data Polygon */}
        <polygon
          points={polyPoints}
          fill="rgba(59, 130, 246, 0.15)"
          stroke="#3b82f6"
          strokeWidth="2"
          className="transition-all duration-1000 ease-in-out"
        />

        {/* Data Points */}
        {data.map((d, i) => {
          const p = getPoint(d.value, i * angleStep);
          return (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="3"
              fill="#3b82f6"
              className="hover:scale-150 transition-transform cursor-crosshair"
            >
              <title>{d.label}: {d.value}/10</title>
            </circle>
          );
        })}

        {/* Labels */}
        {data.map((d, i) => {
          const p = getPoint(12, i * angleStep); // Offset from radius
          const textAnchor = p.x < center ? 'end' : p.x > center ? 'start' : 'middle';
          return (
            <text
              key={i}
              x={p.x}
              y={p.y}
              textAnchor={textAnchor}
              className="text-[8px] font-black fill-slate-500 uppercase tracking-widest"
              dy="0.35em"
            >
              {d.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
