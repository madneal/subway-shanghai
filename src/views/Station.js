class Station extends React.Component {
  render() {
    const props = this.props
    return (
      <g>
        <circle cx={props.cx} cy={props.cy} r="5" fill="white" stroke={props.color} id={props.stationName}></circle>
        <text x={props.x} y={props.y} fill="black"></text>
      </g>
    )
  }
}

export default Station