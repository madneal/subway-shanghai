class Map extends React.Component {
  render() {
    return (
      <div class="map">
        <Station />
      </div>
    )
  }
}

ReactDOM.render(
  <Map />,
  document.getElementById('root')
)