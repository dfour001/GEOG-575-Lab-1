// Mini-detail pane to display in the corner of the map on mobile
var MiniDetailPane = L.Control.extend({
    options: {
        position: 'bottomleft'
    },

    onAdd: function (map) {
        let container = L.DomUtil.create('div', 'mini-detail-pane');

        $(container).append('<p>Confirmed Cases</p><p>in selected region:</p><hr>');
        $(container).append('<p><span class="lblRegionName"></span>: <span class="lblCases"></span> (<span class="lblPercent"></span>)</p>');
        $(container).append('<p>World Total: <span class="lblWorldTotal"></span></p>');

        return container
    }
});

var LegendControl = L.Control.extend({
    options: {
        position: 'bottomright'
    },

    onAdd: function (map) {
        let container = L.DomUtil.create('div', 'legend-control-container');
        $(container).append('<div id="temporal-legend"><b>Legend</b></div><img id="collapse" src="../img/LegendClose.png" data-status="open">');
        
        let legendBody = '<div id="legend-body"><hr>';
        let svg = '<svg id="attribute-legend" width="120px" height="50px">';

        let circles = ['max', 'mean', 'min'];
        
        for (let i = 0; i < circles.length; i++) {
            svg += '<circle class="legend-circle" id="' + circles[i] + '" fill="red" fill-opacity="0.75" stroke="#000000" cx="40" />';
            svg += '<text id="' + circles[i] + '-text" x="60" y="60" class="legend-text"></text>';
        };
        
        svg += '</svg>';
        legendBody += svg + '</div>';
        console.log(legendBody);
        $(container).append(legendBody);
        
        console.log($(container).html());
        
        
        return container
    }
});
