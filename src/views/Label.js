import React from 'react'
import labels from '../data/labels.json'


class Label extends React.Component {
  render() {
    const labelElements = [];
    for (let i = 0; i < labels.length; i++) {
      const label = labels[i];
      if (label.text.lastIndexOf('号线') !== -1) {
        labelElements.push(<text x={label.x} y={label.y} fill={label.fill} key={label.text + i}>{label.text}</text>);
      } else {
        labelElements.push(<text x={label.x} y={label.y} key={label.text+i}>{label.text}</text>);
      }
    }
    return(
      <g>{labelElements}</g>
    )
  }
}

export default Label