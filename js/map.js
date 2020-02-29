// Switch to decide if Hubei should be drawn as transparent or not
var hideHubei = false;

function init() {
    // Create map
    var map = L.map('map', {
        attributionControl: false
    }).fitBounds([
        [4.2149, 70.1367],
        [54.7753, 154.5117]
    ]);

    // Add tile layer
    L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: 'abcd',
        minZoom: 0,
        maxZoom: 20,
        ext: 'png'
    }).addTo(map);


    // Setup custom controls
    map.addControl(new MiniDetailPane());
    map.addControl(new HideHubeiControl());



    // Load data
    $.ajax("data/data.geojson", {
        dataType: 'json',
        success: function (r) {
            let attributes = process_data(r);

            // Set up markers and add them to map
            add_data_to_map(r, map, attributes);

            // Set lblCurrentDate
            $('.lblCurrentDate').html(format_date(attributes[0]));

            // Populate details dropdown
            setup_details_dropdown(map);

            // Create legend
            map.addControl(new LegendControl());

            // Set default details to Hubei
            $('#sel1').val('Hubei');
            update_details_box(map, attributes);




            /////////////////////////
            // Map Event Listeners //
            /////////////////////////

            $('#btnTest').on('click', function () {
                console.log('test');
                console.log(map.getBounds());
            });

            $('#hide-hubei-check').on('click', function () {
                hideHubei = !hideHubei;
                update_markers(map, attributes[$('#slider').val()]);
            })


            // Slider Change
            $('#slider').on('input', function () {
                // Hide slider hint
                $('#lblSliderHint').addClass('lblCurrentDate');

                let sliderVal = $(this).val();
                update_markers(map, attributes[sliderVal]);

                // Update date
                $('.lblCurrentDate').html(format_date(attributes[sliderVal]));

                // Update details
                update_details_box(map, attributes);
            });

            // Slider Skip Buttons Click
            $('.skip').on('click', function () {
                // Hide slider hint
                $('#lblSliderHint').addClass('lblCurrentDate');

                let sliderVal = $('#slider').val();

                if ($(this).attr('id') == 'btnPrev') {
                    // btnPrev clicked
                    if (sliderVal != 0) {
                        sliderVal--;
                    }
                } else {
                    // btnNext clicked
                    if (sliderVal < attributes.length - 1) {
                        sliderVal++;
                    }
                }

                $('#slider').val(sliderVal);
                update_markers(map, attributes[sliderVal]);

                // Update date
                $('.lblCurrentDate').html(format_date(attributes[sliderVal]));

                // Update details
                update_details_box(map, attributes);
            });


            // Details selector dropdown
            $('#sel1').on('change', function () {
                update_details_box(map, attributes);
            })


            // Legend Collapse Button
            $('#collapse').on('click', function () {
                let legendState = $(this).attr('data-status');
                if (legendState == "open") {
                    // Collapse the legend
                    $(this).attr('data-status', 'closed');
                    $(this).attr('src', '../img/LegendOpen.png');
                    $('#legend-body').addClass('legend-hide');
                } else {
                    $(this).attr('data-status', 'open');
                    $(this).attr('src', '../img/LegendClose.png');
                    $('#legend-body').removeClass('legend-hide');
                }
            });
        }
    });



}


function add_data_to_map(r, map, attributes, piechart) {
    // Add China layer
    L.geoJSON(r, {
        pointToLayer: function (f, latlng) {
            return create_marker(f, latlng, "markerChina", attributes, map)
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
            return create_marker(f, latlng, "markerWorld", attributes, map);
        },
        filter: function (f) {
            if (f.properties.Layer == "World") {
                return true
            }
        }
    }).addTo(map);

    // Set initial radius
    update_markers(map, attributes[0]);
}

function update_markers(map, attribute) {
    // On each marker, set the radius based on the
    // input attribute value.  Attribute = the field
    // name for the new radius value.

    map.eachLayer(function (layer) {
        if (layer.feature) {
            // Find new radius for feature
            let props = layer.feature.properties;
            let curAttribute = props[attribute];
            let rad = calculate_radius(props[attribute]);

            if (rad == 0) {
                layer.setStyle({
                    fillOpacity: 0
                });
            } else {
                layer.setStyle({
                    fillOpacity: calculate_opacity(curAttribute)
                });
            }

            // Update radius
            layer.setRadius(rad);
            
            // Hide Hubei if box checked
            if (hideHubei && layer.feature.properties.name == "Hubei") {
                layer.setStyle(noFill);
                console.log('noFill');
            }
        }
    })
}

function calculate_radius(value) {
    let scaleFactor = 3;
    let area = value * scaleFactor;
    let radius = Math.sqrt(area / Math.PI);
    return radius
}

function calculate_radius_log(value) {
    let radius = Math.log(value) / Math.log(1.2);
    return radius
}

function calculate_opacity(value) {
    let opacity = (-0.05 * value + 75) / 100;
    if (opacity < 0.25) {
        opacity = 0.25;
    }
    return opacity
}


function setup_details_dropdown(map) {
    let regionList = [];

    // Get each region's name and add to list
    map.eachLayer(function (layer) {
        if (layer.feature) {
            regionList.push(layer.feature.properties.name);
        }
    })

    // Sort list
    regionList.sort();

    // Add list items to details dropdown
    regionList.forEach(function (regionName) {
        $('#sel1').append("<option>" + regionName + "</option>");
    })
}


function update_details_box(map, attributes, piechart) {
    // Get current region
    let region = $('#sel1').val();

    // Get current date
    let index = $('#slider').val()
    let curDate = attributes[index];

    // Get current region case count for current date
    // Get word total for current date
    let currentRegionCount = 0;
    let worldCount = 0;

    map.eachLayer(function (layer) {
        if (layer.feature) {
            let curLayerName = layer.feature.properties.name;
            let curLayerCount = layer.feature.properties[curDate];

            if (curLayerName == region) {
                currentRegionCount = curLayerCount;
                layer.setStyle({
                    stroke: true,
                    color: 'rgb(0,0,0)',
                    weight: 3
                });
            } else {
                layer.setStyle({
                    stroke: false
                });
            }

            worldCount += curLayerCount;
        }
    });

    // Calculate percentage
    let percentage = currentRegionCount / worldCount * 100;

    // Update region detail labels
    $('.lblRegionName').html(region);
    $('.lblCases').html(currentRegionCount.toLocaleString('en'));
    $('.lblPercent').html(percentage.toPrecision(2) + '%');
    $('.lblWorldTotal').html(worldCount.toLocaleString('en'));
    $('.lblDetailsDate').html(format_date(curDate));

    // Update Legend
    //let circleValues = get_circle_values(map, curDate);
    let circleValues = {
        max: 500,
        mean: 150,
        min: 10
    };
    for (let key in circleValues) {

        //let radius = calculate_radius(circleValues[key]);
        let radius = calculate_radius(circleValues[key]);
        $('#' + key).attr({
            cx: 25,
            cy: 50 - radius,
            r: radius
        });
        $('#' + key + '-text').text(circleValues[key] + ' Cases').attr('y', 50 - (radius));;
    };

}


function get_circle_values(map, attribute) {
    let min = Infinity,
        max = -Infinity;

    map.eachLayer(function (layer) {
        if (layer.feature) {
            let attributeValue = Number(layer.feature.properties[attribute]);
            if (attributeValue < min) {
                min = attributeValue;
            };

            if (attributeValue > max) {
                max = attributeValue;
            };
        };
    });



    let mean = (max + min) / 3;

    return {
        max: max,
        mean: mean,
        min: 25
    };
}


function format_date(date) {
    let input = date.split('-');
    let month = input[0] == 'Jan' ? 'January' : 'February';
    let day = input[1];
    return month + ' ' + day
}

/////////////
// Markers //
/////////////

// Marker Styles
var styleChina = {
    fillColor: 'red',
    weight: 0.5,
    stroke: false
};

var styleWorld = {
    fillColor: 'orange',
    stroke: false,
};

var noFill = {
    fillOpacity: 0
}

// Marker Functions
function process_data(r) {
    // Creates a list of field names containing
    // data by date

    let attributes = [];
    let properties = r.features[0].properties;

    for (let attribute in properties) {
        if (attribute.indexOf("Jan") > -1 || attribute.indexOf("Feb") > -1) {
            attributes.push(attribute)
        }
    };

    return attributes
}



function create_marker(f, latlng, markerClass, attributes, map, piechart) {
    // Set marker style
    let style = markerClass == "markerChina" ? styleChina : styleWorld;

    // Create marker
    let marker = L.circleMarker(latlng, style);

    // Set the initial marker radius to the value of Jan-20
    marker.setRadius(calculate_radius(f.properties['Jan-20']));

    marker.on({
        click: function () {
            // Set value of details dropdown, which will
            // trigger the details box to update with this
            // marker's details
            $('#sel1').val(f.properties.name);
            update_details_box(map, attributes, piechart);
        }
    });

    return marker
};




// Run initizlization function when the dom is ready
$(document).ready(init());
