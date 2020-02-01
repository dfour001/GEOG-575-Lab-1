//////////////////////////////
/* GETTING STARTED TUTORIAL */
//////////////////////////////

// Create map and add it to the #map div
var map = L.map('map').setView([51.505, -0.09], 13);

// Add tile layer
L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
}).addTo(map);

// Create a simple marker and add to the map
var marker = L.marker([51.5, -0.09]).addTo(map);

// Create a simple circle and add to the map
var circle = L.circle([51.508, -0.11], 500, {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5
}).addTo(map);

// Create a simple polygon and add to the map
var polygon = L.polygon([
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
]).addTo(map);

// Create popups for each of the above geometries
marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
circle.bindPopup("I am a circle.");
polygon.bindPopup("I am a polygon.");

// Create a standalone popup
var popup = L.popup()
    .setLatLng([51.5, -0.09])
    .setContent("I am a standalone popup.")
    .openOn(map);

// Function called when the map is clicked. It uses the standalone popup created above
function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map);
}

// Event listener for clicking on the map
map.on('click', onMapClick);



//////////////////////
/* GEOJSON TUTORIAL */
//////////////////////

// GeoJSON data as a JS variable
var geojsonFeature = {
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "amenity": "Baseball Stadium",
        "popupContent": "This is where the Rockies play!"
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
};

// Function called on each feature in the GeoJSON object
function onEachFeature(feature, layer) {
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.popupContent) {
        layer.bindPopup(feature.properties.popupContent);
    }
}

// Create a geoJSON oobject and add to map
L.geoJSON(geojsonFeature, {
    onEachFeature: onEachFeature
}).addTo(map);


