mapboxgl.accessToken = 'pk.eyJ1IjoicnNlbG92ZXIiLCJhIjoiY21hbGJxMGxjMDZ6MDJtb3JqMWx5ZHh0YSJ9.50NQFxaZLsWruJ8dFIqfXw';

// CSV URL with the Phish show location data (lat/lon)
const csvUrl = 'https://gist.githubusercontent.com/rselover/9d4c1543a8dc994ca151cff20aa8fe1f/raw/5a99753828073ee1d90d1b2bbf4da2393209e414/phish_geocode.csv';

// Load data from CSV file
d3.csv(csvUrl, row => {
  return {
    position: [+row.lon, +row.lat] // Get the longitude and latitude
  };
}).then(data => {

  // Initialize the Mapbox map
  const map = new mapboxgl.Map({
    container: 'map', // The HTML element ID to render the map
    style: 'mapbox://styles/mapbox/dark-v11', // Mapbox style (flat Mercator projection)
    center: [-95, 40], // Longitude, Latitude of the center of the map
    zoom: 3, // Initial zoom level
    pitch: 20, // Slight pitch for 3D effect
    bearing: 0 // No rotation (top-down view)
  });

  // Ensure the map uses a Mercator projection (flat map), not globe
  map.on('style.load', () => {
    map.setProjection('mercator'); // Force the map to use a flat Mercator projection
  });

  // When the map has fully loaded, we add the hexagon layer
  map.on('load', () => {

    // Create the Deck.gl HexagonLayer
    const hexLayer = new deck.HexagonLayer({
      id: 'phish-hex-layer',
      data, // Pass the data (lat/lon positions)
      radius: 20000, // Size of the hexagons
      elevationScale: 250, // Increase vertical exaggeration (higher value)
      extruded: true, // Enable 3D extrusion of hexagons
      pickable: true, // Make hexagons clickable (if needed)
      getPosition: d => d.position, // Accessor function for latitude/longitude position
      colorRange: [
        [255, 255, 204], // Lightest color for smallest values
        [255, 204, 204], // Light red for slightly higher values
        [255, 153, 153], // Medium red
        [255, 102, 102], // Stronger red
        [255, 51, 51],   // Darker red
        [255, 0, 0]      // Bright red for largest values (this is now the largest hexagon color)
      ],
      opacity: 0.9 // Set the opacity of the hexagons
    });

    // Create a MapboxOverlay to add Deck.gl layer to Mapbox map
    const deckOverlay = new deck.MapboxOverlay({ layers: [hexLayer] });

    // Add the Deck.gl overlay to the Mapbox map
    map.addControl(deckOverlay);
  });
});
