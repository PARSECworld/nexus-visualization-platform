// Define our namespace
frame = {}

// Default map rendering configurations
frame.DEFAULT_ZOOM = 4;
frame.LAT = -14.2400732;
frame.LNG = -53.1805017;

frame.DEFAULT_COLOR  = "#009999";
frame.SELECTED_COLOR = "#FF5733";

frame.App = class {
  map = null;
  layers = {};

  constructor () {
    this.map = frame.App.createMapInstance();
    this.map.data.setStyle( function(feature) {
      var color = frame.DEFAULT_COLOR;
      var opacity = 0.5;
      var stroke = 0.6;
      var selected = feature.getProperty("selected") ?? false;
      if (selected) {
        color = frame.SELECTED_COLOR;
        opacity = 0.8;
        stroke = 1.0;
      }
      return /** @type {!google.maps.Data.StyleOptions} */ (
        {
          fillColor: color
          ,fillOpacity: opacity
          ,strokeWeight: stroke
          ,clickable: true
        }
      )
    });
  }

  async load_layer() {
    this.map.data.addGeoJson(layer_estados);
  }

  async remove_layer() {

  }

  static createMapInstance() {
    var map_element = document.getElementById('map');
    var map = new google.maps.Map(
      map_element,
      {
        center    : new google.maps.LatLng(frame.LAT, frame.LNG),
        zoom      : frame.DEFAULT_ZOOM,
        mapTypeId : google.maps.MapTypeId.ROADMAP 
      }
    );
    return map;
  }
}

async function initialize() {
  var app = new frame.App();

  await app.load_layer();

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
  })
}

window.addEventListener('load', initialize, true)