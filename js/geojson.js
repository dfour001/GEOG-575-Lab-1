function init() {
    var map = L.map('map').setView([20, 0], 2);

    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);


    $.ajax("data/MegaCities.geojson", {
        dataType: "json",
        success: function (r) {
            let attributes = processData(r);

            createPropSymbols(r, map, attributes);
            createSequenceControls(map, attributes);
        }
    })
}


function processData(r) {
    let attributes = []

    let properties = r.features[0].properties;

    for (let attribute in properties) {
        if (attribute.indexOf("Pop") > -1) {
            attributes.push(attribute);
        }
    }

    return attributes
}


function createSequenceControls(map, attributes) {
    $('#controls').append('<input class="range-slider" type="range">');
    $('#controls').append('<br><button class="skip" id="reverse">Reverse</button>');
    $('#controls').append('<button class="skip" id="forward">Forward</button>');

    $('.range-slider').attr({
        max: 6,
        min: 0,
        value: 0,
        step: 1
    });

    $('.skip').click(function () {
        let index = $('.range-slider').val();
        if ($(this).attr('id') == 'forward') {
            index++;
            index = index > 6 ? 0 : index;
        } else if ($(this).attr('id') == 'reverse') {
            index--;
            index = index < 0 ? 6 : index;
        }
        
        $('.range-slider').val(index);
        
        updatePropSymbols(map, attributes[index]);
    })

    $('.range-slider').on('input', function () {
        let index = $(this).val();
        
        updatePropSymbols(map, attributes[index]);
    })
}


function updatePropSymbols(map, attribute) {
    map.eachLayer(function (layer) {
        if (layer.feature && layer.feature.properties[attribute]) {
            let props = layer.feature.properties;
            
            let radius = calculatePropRadius(props[attribute]);
            layer.setRadius(radius);
            
            let popupContent = "<p><b>City:</b> " + props.City + "</p>";
            
            let year = attribute.split("_")[1];
            popupContent += "<p><b>Population in " + year + ":</b> " + props[attribute] + " million</p>";
            
            layer.bindPopup(popupContent, {
                offset: new L.Point(0,-radius)
            });
        }
    })
}


function createPropSymbols(r, map, attributes) {
    L.geoJSON(r, {
        pointToLayer: function (feature, latlng) {
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
}


function pointToLayer(f, latlng, attributes) {
    let attribute = attributes[0];
    let attValue = Number(f.properties[attribute])

    let markerStyle = {
        radius: calculatePropRadius(attValue),
        fillColor: "#ff7800",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    let lyr = L.circleMarker(latlng, markerStyle);
    let year = attribute.split('_')[1];
    let popupContent = '<p><b>City:</b> ' + f.properties.City + '</p><p><b>' + year + ':</b> ' + f.properties[attribute] + ' million</p>';

    lyr.bindPopup(popupContent);

    lyr.on({
        mouseover: function () {
            this.openPopup();
        },
        mouseout: function () {
            this.closePopup();
        },
        click: function () {
            $('#panel').html(popupContent);
        }
    })

    return lyr
}

function calculatePropRadius(attValue) {
    var scaleFactor = 50;
    var area = attValue * scaleFactor;
    var radius = Math.sqrt(area / Math.PI);
    return radius
}


$(document).ready(init());
