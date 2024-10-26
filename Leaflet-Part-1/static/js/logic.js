// Initialize the map centered on the western United States
const map = L.map('map').setView([37.5, -119.5], 5);

// Base layers
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© Basemap from OpenStreetMap'
}).addTo(map);

// Initialize layer for earthquake markers
const earthquakes = L.layerGroup().addTo(map);

// Function to determine marker size based on magnitude
function markerSize(magnitude) {
    return magnitude * 5; // Adjust multiplier to control size
}

// Function to determine marker color based on depth
function markerColor(depth) {
    return depth > 90 ? '#FF4500' :
           depth > 70 ? '#FF6347' :
           depth > 50 ? '#FFA500' :
           depth > 30 ? '#FFD700' :
           depth > 10 ? '#FFFF00' :
                        '#ADFF2F';
}

// Fetch and display earthquake data
d3.json('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson').then(data => {
    data.features.forEach(feature => {
        const { mag, place, time } = feature.properties;
        const [longitude, latitude, depth] = feature.geometry.coordinates;

        // Create a circle marker for each earthquake
        L.circleMarker([latitude, longitude], {
            radius: markerSize(mag),
            fillColor: markerColor(depth),
            color: '#000',
            weight: 0.5,
            opacity: 1,
            fillOpacity: 0.8
        }).bindPopup(`<h4>Location: ${place}</h4>
                      <hr>
                      <p>Magnitude: ${mag}</p>
                      <p>Depth: ${depth} km</p>
                      <p>Time: ${new Date(time)}</p>`)
        .addTo(earthquakes);
    });
}).catch(error => console.error('Error fetching earthquake data:', error));

// Function to create the legend for depth ranges
function createLegend() {
    const legend = L.control({position: 'bottomright'});

    legend.onAdd = function () {
        const div = L.DomUtil.create('div', 'legend');
        const depths = [-10, 10, 30, 50, 70, 90];
        const labels = ["-10-10", "10-30", "30-50", "50-70", "70-90", "90+"];

        for (let i = 0; i < depths.length; i++) {
            div.innerHTML +=
                `<i style="background:${markerColor(depths[i] + 1)}"></i> ${labels[i]}<br>`;
        }
        return div;
    };

    legend.addTo(map);
}

// Add legend to the map
createLegend();
