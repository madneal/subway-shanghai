import React from 'react';
import labels from '../data/labels.json';

function isLineLabel(text) {
  return (
    text.includes('号线') ||
    text.includes('磁浮') ||
    text.includes('浦江') ||
    text.includes('机场')
  );
}

class Label extends React.Component {
  render() {
    const labelElements = [];
    for (let i = 0; i < labels.length; i++) {
      const label = labels[i];
      if (isLineLabel(label.text) && label.fill) {
        labelElements.push(
          <text
            x={label.x}
            y={label.y}
            fill={label.fill}
            fontWeight="700"
            key={label.text + i}
          >
            {label.text}
          </text>
        );
      } else {
        labelElements.push(
          <text x={label.x} y={label.y} key={label.text + i}>
            {label.text}
          </text>
        );
      }
    }
    return <g className="labels">{labelElements}</g>;
  }
}

export default Label;
