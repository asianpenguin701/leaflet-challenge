// Initialize the map and center on dataset
const map = L.map('map', {center: [20, 0], zoom: 2}); 

// Base layers
const satellite = L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}', {attribution: '© Basemap from U.S. Geological Survey'});
const grayscale = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {attribution: '© Basemap from CartoDB'});
const outdoors = L.tileLayer('https://tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=739b4254a9964186a16c957b8b1b52dd', {
    attribution: '© Basemap from Thunderforest'
});
// Add satellite layer as default
satellite.addTo(map);

// Define overlay groups
const tectonicPlates = new L.LayerGroup();
const earthquakes = new L.LayerGroup();

// Base maps object for the layer control
const baseMaps = {
    "Satellite": satellite,
    "Grayscale": grayscale,
    "Outdoors": outdoors
};

// Overlay maps object for the layer control
const overlayMaps = {
    "Tectonic Plates": tectonicPlates,
    "Earthquakes": earthquakes
};

// Layer control
L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(map);

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

    // Add the earthquake layer to the map
    earthquakes.addTo(map);
}).catch(error => console.error('Error fetching earthquake data:', error));

// Fetch and display tectonic plates data
d3.json('https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json').then(data => {
    L.geoJSON(data, {
        style: {
            color: "orange",
            weight: 2
        }
    }).addTo(tectonicPlates);
    
    // Add the tectonic plates layer to the map
    tectonicPlates.addTo(map);
}).catch(error => console.error('Error fetching tectonic plates data:', error));

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
