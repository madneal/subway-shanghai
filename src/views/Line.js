import React from 'react';
import linePath, { lineColor } from '../data/Data';

class Line extends React.Component {
  render() {
    const linePaths = [];

    for (const key in linePath) {
      const path = linePath[key];
      if (!path) continue;
      // Prefer exact key, then numeric prefix (e.g. 10a → 10 color already stored on key).
      const color = lineColor[key] || lineColor[key.match(/^\d+/)?.[0]] || '#999999';
      linePaths.push(
        <path
          d={path}
          fill="none"
          strokeWidth="6"
          stroke={color}
          key={key}
          data-line={key}
        />
      );
    }

    return <g className="lines">{linePaths}</g>;
  }
}

export default Line;
