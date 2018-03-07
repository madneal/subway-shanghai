class Map extends React.Component {
  render() {
    return (
      <div class="map">
        <svg class="svg" viewbox="0 0 2300 2300" autofocus>
          <Station />
        </svg>
      </div>
    )
  }
}

ReactDOM.render(
  <Map />,
  document.getElementById('root')
)