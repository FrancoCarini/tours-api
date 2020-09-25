export const displayMap = (locations) => {
  mapboxgl.accessToken = 'pk.eyJ1IjoiZnJhbmNvY2FyaW5pIiwiYSI6ImNrZmFiMmFhZjA0MXEycnA4bGg3ZXU2bDIifQ._xcvzA9wMyZKuT9rhE6vkw';

  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/francocarini/ckfbefkqy0qef19s11kzae0t0',
    scrollZoom: false
  });


  const bounds = new mapboxgl.LngLatBounds()

  locations.forEach(loc => {
    // create marker
    const el = document.createElement('div')
    el.className = 'marker'

    // add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    }).setLngLat(loc.coordinates).addTo(map)

    // Add popup
    new mapboxgl.Popup({
      offset: 30
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map)

    // entends map bounds to include current location
    bounds.extend(loc.coordinates)
  })

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100
    }
  })
}
