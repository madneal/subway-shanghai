import React, { Component } from 'react';
import labels from '../labels.json'

class Map extends React.Component {
  render() {
    const labelElements = [];
    console.dir(labels)
    for (let i = 0; i < labels.length; i++) {
      const label = labels[i];
      labelElements.push(<text x={label.x} y={label.y} fill={label.fill} key={label.text}>{label.text}</text>);
    }
    return (
      <div className="map">
        <svg className="svg" viewBox="0 0 2300 2300" autoFocus>
        {labelElements}
          {/* <Station /> */}
        </svg>
      </div>
    )
  }
}


export default Map