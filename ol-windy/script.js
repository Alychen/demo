var map = new ol.Map({
  layers: [
    new ol.layer.Tile({
      source: new ol.source.Stamen({
        layer: 'toner'
      })
    })
  ],
  interactions: ol.interaction.defaults({
    altShiftDragRotate: false,
    rotate: false
  }),
  target: 'olMap',
  view: new ol.View({
    center: [-28156928.655903842, 3937109.395913458],
    zoom: 6
  })
});

var windy;
var PARTICLE_MULTIPLIER = 1 / 30;
var canvas = document.getElementById('windyMap');
function refreshWindy() {
  if(!windy) {
    return;
  }
  windy.stop();
  var mapSize = map.getSize();
  var extent = map.getView().calculateExtent(mapSize);
  extent = ol.proj.transformExtent(extent, 'EPSG:3857', 'EPSG:4326');

  canvas.width = mapSize[0];
  canvas.height = mapSize[1];

  // console.log(mapSize,extent);
  if(extent[3] - extent[0] > 500){
    PARTICLE_MULTIPLIER = 1/30
  }else if(extent[3] - extent[0] > 300) {
    PARTICLE_MULTIPLIER = 1/100
  }else if(extent[3] - extent[0] > 100) {
    PARTICLE_MULTIPLIER = 1/500
  }else if(extent[3] - extent[0] > 50) {
    PARTICLE_MULTIPLIER = 1/1000
  }else if(extent[3] - extent[0] > 0.1) {
    PARTICLE_MULTIPLIER = 1/3000
  }else if(extent[3] - extent[0] < 0) {
    PARTICLE_MULTIPLIER = 1/5000
  }

  windy.start(
    [[0,0], [canvas.width, canvas.height]],
    canvas.width,
    canvas.height,
    [[extent[0], extent[1]],[extent[2], extent[3]]],
    PARTICLE_MULTIPLIER
  );
}

fetch('http://esri.github.io/wind-js/gfs.json').then(function(response) {
  return response.json();
}).then(function(json) {
  windy = new Windy({canvas: canvas, data: json });
  refreshWindy();
});

map.on('moveend', refreshWindy);
map.on("singleclick",function(e){
  console.log(e.coordinate);
})
