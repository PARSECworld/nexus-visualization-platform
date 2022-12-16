const lerp = (x, y, a) => x * (1 - a) + y * a;
const hex2dec = hex => parseInt(hex, 16);
const dec2hex = dec => dec.toString(16);

indicators = ['income', 'literacy', 'longevity']
// Define our namespace
frame = {}
var app;

// Default map rendering configurations
frame.DEFAULT_ZOOM = 4;
frame.LAT = -14.2400732;
frame.LNG = -53.1805017;
frame.DEFAULT_LAYER = layer_estados;
frame.DEFAULT_INDICATOR = "income";

frame.PALLETE_MIN = "FF";
frame.PALLETE_MAX = "00";


// COLORMAP
function colormap(a) {
  var color = lerp(hex2dec(frame.PALLETE_MIN), hex2dec(frame.PALLETE_MAX), a);
  return dec2hex(Math.round(color));
}

frame.App = class {
  map = null;

  constructor () {
    this.map = frame.App.createMapInstance();

    this.indicator = frame.DEFAULT_INDICATOR;
    this.layer = frame.DEFAULT_LAYER;

    this.map.data.setStyle( function(feature) {
      var score = feature.j[app.indicator];
      var color = `#FF${colormap(score)}00`;
      var opacity = 0.65;
      var stroke = 0.6;
      var selected = feature.getProperty("selected") ?? false;
      if (selected) {
        opacity = 0.9;
        stroke = 1.0;
      }
      return (
        {
          fillColor: color
          ,fillOpacity: opacity
          ,strokeWeight: stroke
          ,clickable: true
        }
      )
    });    
  }

  remove_layer() {
    console.log("removing layer.");
    var appMap = this.map;
    appMap.data.forEach(function(feature) {
      appMap.data.remove(feature)
    });
    console.log("layer removed.");
  }

  load_layer() {
    this.remove_layer();
    console.log('loading new layer.');
    this.map.data.addGeoJson(this.layer);
    console.log('layer loaded.');
  }

  static createMapInstance() {
    var map_element = document.getElementById('map');
    var map = new google.maps.Map(
      map_element,
      {
        center    : new google.maps.LatLng(frame.LAT, frame.LNG),
        zoom      : frame.DEFAULT_ZOOM,
        mapTypeId : google.maps.MapTypeId.ROADMAP
        ,streetViewControl : false
      }
    );
    return map;
  }
}

function initialize() {
  app = new frame.App();

  // Listeners //
  app.map.data.addListener('mouseover', function(event) {
    app.map.data.revertStyle();
    app.map.data.overrideStyle(event.feature, {strokeWeight: 1, fillOpacity: 0.8});
  });
  app.map.data.addListener('mouseout', function(event) {
    app.map.data.revertStyle();
  });
  app.map.data.addListener('click', function(event) {
    var selected = event.feature.getProperty("selected") ?? false;
    event.feature.setProperty("selected", !selected);
    console.log(event.feature.j.Cod_estado);
  });
  app.map.data.addListener("setproperty", function(event) {
    var propertyName = event.name;
  });
  app.load_layer();
}

function callLayerChange(event) {
  console.log(event.data);
  if (event.data == 'municipalities') {
    app.layer = layer_municipios;
    app.load_layer();
  } else if (event.data == 'states') {
    app.layer = layer_estados;
    app.load_layer();
  } else if (indicators.includes(event.data)) {
    app.indicator = event.data;
    app.load_layer();
  }
}

window.addEventListener('load', initialize);
window.addEventListener('message', callLayerChange, false);