function init() {
    var map = L.map('map').setView([20, 0], 2);

    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);


    $.ajax("data/MegaCities.geojson", {
        dataType: "json",
        success: function (r) {
            let markerStyle = {
                radius: 8,
                fillColor: "#ff7800",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };

            L.geoJSON(r, {
                pointToLayer: function (f, latlng) {
                    return L.circleMarker(latlng, markerStyle);
                },
                onEachFeature: addPopups
            }).addTo(map);
        }
    })
}


function addPopups(feature, layer) {
    let popupContent = "";
    if (feature.properties) {
        console.log(feature, layer);
        for (var property in feature.properties) {
            popupContent += "<p>" + property + ": " + feature.properties[property] + "<p>";
        }
        layer.bindPopup(popupContent);
    }
}

$(document).ready(init());
