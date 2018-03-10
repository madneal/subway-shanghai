import React from 'react';
import labels from '../data/labels.json'
import Line from './Line'

class Map extends React.Component {
  render() {
    const labelElements = [];
    console.dir(labels)
    for (let i = 0; i < labels.length; i++) {
      const label = labels[i];
      labelElements.push(<text x={label.x} y={label.y} fill={label.fill} key={label.text + i}>{label.text}</text>);
    }
    return (
      <div className="map">
        <svg className="svg" viewBox="0 0 2300 2300" autoFocus>
        {labelElements}
        <Line />
          {/* <Station /> */}
        </svg>
      </div>
    )
  }
}


export default Map