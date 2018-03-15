import React from 'react'
import linePath from '../data/Data'
import { lineColor } from '../data/Data'

class Line extends React.Component {
  render() {
    const linePaths = [];

    for (const key in linePath) {
      const path = linePath[key];
      const lineNum = key.match(/\d+/)[0];
      const color = lineColor[lineNum];
      linePaths.push(<path d={path} fill="none" strokeWidth="6" stroke={color} key={key}></path>);
    }

    return (
      <g>{linePaths}</g>
    )
  }
}

export default Line;
