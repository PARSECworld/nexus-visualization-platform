// Define our namespace
frame = {}

// Default map rendering configurations
frame.DEFAULT_ZOOM = 4;
frame.LAT = -14.2400732;
frame.LNG = -53.1805017;

// frame.layers = {
//   "mun" : layer_municipios
//   ,"state" : layer_estados
// }

frame.App = class {
  map = null;
  layers = {};

  constructor () {
    this.map = frame.App.createMapInstance();
  }

  load_layer() {
    this.map.data.addGeoJson();
    this.map.data.setStyle({
      fillColor:"#009999"
      ,fillOpacity: 0.5
      ,strokeWeight: 1
    })
  }

  remove_layer() {

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

function initialize() {
  var app = new frame.App();
}

window.addEventListener('load', initialize, true)