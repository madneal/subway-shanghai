class Line extends React.Component {
  render() {
    const props = this.props;
    <g>
      <path d={props.path} fill="none" stroke-width="6" stoke={lineColor}></path>
      <text x={x} y={y} fill={lineColor}></text>
    </g>
  }
}