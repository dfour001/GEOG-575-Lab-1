function init() {
    // Create map
    var map = L.map('map').setView([0, 0], 1);

    // Add tile layer
    L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: 'abcd',
        minZoom: 0,
        maxZoom: 20,
        ext: 'png'
    }).addTo(map);


    // Setup custom controls

    // Load data
    $.ajax("data/data.geojson", {
        dataType: 'json',
        success: function (r) {
            // Set up markers and add them to map
            add_data_to_map(r, map);
        }

    })
    let change = 30
    $('#btnTest').on('click', function () {
        change += 30;
        $('.Hebei').animate({width: change,
                            height: change
                            },200);
        console.log($('.Hebei'));
        console.log("test");
    });
}


function add_data_to_map(r, map) {

    console.log(r);
    // Add China layer
    L.geoJSON(r, {
        pointToLayer: function (f, latlng) {
            return create_marker(f, latlng, "markerChina")
        },
        filter: function (f) {
            if (f.properties.Layer == "China") {
                return true
            }
        }
    }).addTo(map);

    // Add World layer
    L.geoJSON(r, {
        pointToLayer: function (f, latlng) {
            return L.circleMarker(latlng);
        },
        filter: function (f) {
            if (f.properties.Layer == "World") {
                return true
            }
        },
        style: styleWorld
    }).addTo(map);
}






/////////////
// Markers //
/////////////

// Styles


var worldDivicon = L.divIcon({
    html: '<div class="markerWorld"></div>'
});


// Functions

function create_marker(f, latlng, markerClass) {
    let markerID = f.properties.Region;
    var divIcon = L.divIcon({
    html: '<div class="' + markerClass + ' ' + markerID + '"></div>'
});
    let marker = L.marker(latlng, {
        icon: divIcon
    });
    
    marker.id = markerID;
    marker.setRadius = function (rad) {
        console.log(rad);
    };
    return marker
}

var styleChina = {
    fillColor: 'red',
    fillOpacity: 0.75,
    stroke: false
};

var styleWorld = {
    fillColor: 'orange',
    fillOpacity: 0.75,
    stroke: false
};



// Run initizlization function when the dom is ready
$(document).ready(init());
