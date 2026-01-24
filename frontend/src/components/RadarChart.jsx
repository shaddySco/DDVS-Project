import React from 'react';

export default function RadarChart({ data, size = 300 }) {
  const points = Object.values(data);
  const labels = Object.keys(data);
  const numPoints = points.length;
  const center = size / 2;
  const radius = center * 0.7;

  // Convert polar coordinates to Cartesian
  const getCoordinates = (index, value) => {
    const angle = (Math.PI * 2 * index) / numPoints - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const getLabelCoordinates = (index) => {
    const angle = (Math.PI * 2 * index) / numPoints - Math.PI / 2;
    const r = radius + 25;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Generate background polygons (the grid)
  const gridLevels = [25, 50, 75, 100];
  const gridPolygons = gridLevels.map((level) => {
    return Array.from({ length: numPoints })
      .map((_, i) => {
        const coords = getCoordinates(i, level);
        return `${coords.x},${coords.y}`;
      })
      .join(' ');
  });

  // Generate the data polygon
  const dataPolygon = Array.from({ length: numPoints })
    .map((_, i) => {
      const coords = getCoordinates(i, points[i]);
      return `${coords.x},${coords.y}`;
    })
    .join(' ');

  return (
    <div className="relative flex items-center justify-center p-4">
      <svg width={size} height={size} className="overflow-visible">
        {/* Background Grid */}
        {gridPolygons.map((poly, idx) => (
          <polygon
            key={idx}
            points={poly}
            fill="none"
            stroke="white"
            strokeOpacity="0.05"
            strokeWidth="1"
          />
        ))}

        {/* Axis Lines */}
        {Array.from({ length: numPoints }).map((_, i) => {
          const coords = getCoordinates(i, 100);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={coords.x}
              y2={coords.y}
              stroke="white"
              strokeOpacity="0.05"
              strokeWidth="1"
            />
          );
        })}

        {/* Data Polygon */}
        <polygon
          points={dataPolygon}
          fill="rgba(0, 243, 255, 0.2)"
          stroke="#00f3ff"
          strokeWidth="2"
          className="transition-all duration-1000 ease-out"
          style={{ filter: 'drop-shadow(0 0 8px rgba(0, 243, 255, 0.4))' }}
        />

        {/* Data Points */}
        {Array.from({ length: numPoints }).map((_, i) => {
          const coords = getCoordinates(i, points[i]);
          return (
            <circle
              key={i}
              cx={coords.x}
              cy={coords.y}
              r="4"
              fill="#00f3ff"
              className="transition-all duration-1000 ease-out"
            />
          );
        })}

        {/* Labels */}
        {labels.map((label, i) => {
          const coords = getLabelCoordinates(i);
          return (
            <text
              key={i}
              x={coords.x}
              y={coords.y}
              textAnchor="middle"
              className="text-[9px] font-black uppercase tracking-widest fill-gray-500"
            >
              {label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
