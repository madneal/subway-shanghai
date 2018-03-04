class Station extends React.Component {
  render() {
    const props = this.props
    return (
      <circle cx={props.cx} cy={props.cy} r="5" fill="white" stroke={props.color} id={props.stationName}></circle>
    )
  }
}