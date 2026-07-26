import React from 'react';
import labels from '../data/labels.json';

function isLineLabel(label) {
  if (label.kind === 'line') return true;
  const text = label.text || '';
  return (
    text.includes('号线') ||
    text.includes('磁浮') ||
    text.includes('浦江') ||
    text.includes('机场')
  );
}

class Label extends React.Component {
  render() {
    const lineLabels = [];
    const stationLabels = [];

    for (let i = 0; i < labels.length; i++) {
      const label = labels[i];
      if (isLineLabel(label) && label.fill) {
        lineLabels.push(
          <text
            className="line-label"
            x={label.x}
            y={label.y}
            fill={label.fill}
            key={'line-' + label.text + i}
          >
            {label.text}
          </text>
        );
      } else if (!isLineLabel(label)) {
        stationLabels.push(
          <text
            className="station-label"
            x={label.x}
            y={label.y}
            key={'st-' + label.text + i}
          >
            {label.text}
          </text>
        );
      }
    }

    // Station names under line names so line titles stay on top.
    return (
      <g className="labels">
        <g className="station-labels">{stationLabels}</g>
        <g className="line-labels">{lineLabels}</g>
      </g>
    );
  }
}

export default Label;
