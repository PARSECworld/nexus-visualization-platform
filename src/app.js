const lerp = (x, y, a) => x * (1 - a) + y * a;
const norm = (min,max,x) => (x-min)/(max-min);
const hex2dec = hex => parseInt(hex, 16);
const dec2hex = dec => dec.toString(16).padStart(2, '0');

indicators = ['income', 'literacy', 'longevity']
indicadores = {
  'income': "Renda",
  'literacy': "Alfabetização",
  'longevity': "Longevidade"
}
var layer_estados;
$.getJSON("https://nexus-polygons.s3.amazonaws.com/estadosBR.json", function(data) {
  layer_estados = data;
});
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
  infoWindow = null;

  constructor () {
    this.map = frame.App.createMapInstance();

    this.indicator = frame.DEFAULT_INDICATOR;
    this.layer = frame.DEFAULT_LAYER;  
  }

  feature_style(feature, minimum_feature_score, maximum_feature_score) {
    var indicatorName = this.indicator;
    this.map.data.setStyle( function(feature) {
      var score = feature.j[indicatorName];
      var color = `#FF${colormap(norm(minimum_feature_score, maximum_feature_score, score))}00`;
      var opacity = 0.65;
      var stroke = 0.6;
      var selected = feature.getProperty("selected") ?? false;
      if (selected) {
        opacity = 0.9;
        stroke = 1.0;
      }
      return ({fillColor: color, fillOpacity: opacity,strokeWeight: stroke,clickable: true})
    });
  }

  remove_layer() {
    console.log("removing layer.");
    var appMap = this.map;
    appMap.data.forEach(function(feature) {
      appMap.data.remove(feature);
    });
    console.log("layer removed.");
  }

  load_layer() {
    this.remove_layer();
    console.log('loading new layer.');
    this.map.data.addGeoJson(this.layer);
    this.color_layer();
    console.log('layer loaded.');
    window.parent.postMessage('loadedMap', '*');
  }

  color_layer() {
    var maxScore = -Infinity;
    var minScore =  Infinity;
    var indicatorName = this.indicator;
    this.map.data.forEach( function(feature) {
      var score = feature.j[indicatorName];
      if (score >= maxScore) {
        maxScore = score;
      }
      if (score <= minScore) {
        minScore = score;
      }
    });
    console.log(`max: ${maxScore}`);
    console.log(`min: ${minScore}`);
    this.map.data.forEach(feature => app.feature_style(feature, minScore, maxScore));
  }

  openInfoWindow(feature) {
    var indicatorName = this.indicator;
    var indicatorValue = feature.j[indicatorName].toFixed(3);
    var indicatorTarget = feature.j[`${indicatorName}_target`].toFixed(3) ?? 'Desconhecido';
    var stateName = feature.j["Name_estado"] ?? "";
    var municipalityName = feature.j["Name_municipio"] ?? "";
    if (municipalityName != "") {
      municipalityName = `${municipalityName} - `;
    }
    var contentString = 
      '<div id="info-window-container">' +
      '<div id="info">' +
      `<h1 id="heading">${municipalityName} ${stateName}</h1>` +
      '<div id="infoBody">' +
      `<p id="indicator-name">${indicadores[indicatorName]}</p>` +
      `<p>Valor predito: ${indicatorValue}</p>` +
      `<p>Valor real: ${indicatorTarget}</p>` +
      '</div>' +
      '</div>' +
      '</div>';
    this.infoWindow = new google.maps.InfoWindow({
      content: contentString
      ,position: {lat: frame.LAT, lng: frame.LNG}
    });
    this.infoWindow.open({map: this.map});
  }

  closeInfoWindow() {
    this.infoWindow.close();
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
    app.openInfoWindow(event.feature);
    app.map.data.revertStyle();
    app.map.data.overrideStyle(event.feature, {strokeWeight: 1, fillOpacity: 0.8});
  });
  app.map.data.addListener('mouseout', function(event) {
    app.closeInfoWindow();
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
    window.parent.postMessage('loadingMap', '*');
    app.layer = layer_municipios; 
  } else if (event.data == 'states') {
    window.parent.postMessage('loadingMap', '*');
    app.layer = layer_estados;
  } else if (indicators.includes(event.data)) {
    window.parent.postMessage('loadingMap', '*');
    app.indicator = event.data;
  } else if (event.data == 'load') {
    app.load_layer();
  }
}

window.addEventListener('load', initialize);
window.addEventListener('message', callLayerChange, false);