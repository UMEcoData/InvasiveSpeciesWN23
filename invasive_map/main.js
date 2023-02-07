import './map_style.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import {fromLonLat} from 'ol/proj.js';
import {transform} from 'ol/proj.js';

const origin_loc = fromLonLat([-0.12755, 51.507222]);
const michigan_loc = fromLonLat([-84, 45]);

const view = new View({
    center: transform([-84, 45], 'EPSG:4326', 'EPSG:3857'),
    zoom: 5.7
});


const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM()
    })
  ],
  view: view
});


function onClick(id, callback) {
    document.getElementById(id).addEventListener('click', callback);
}
function flyTo(location, done) {
    const duration = 2000;
    const zoom = View.zoom;
    let parts = 2;
    let called = false;
    function callback(complete) {
      --parts;
      if (called) {
        return;
      }
      if (parts === 0 || !complete) {
        called = true;
        done(complete);
      }
    }
    view.animate(
      {
        center: location,
        duration: duration,
      },
      callback
    );
    view.animate(
      {
        zoom: zoom - 1,
        duration: duration / 2,
      },
      {
        zoom: zoom,
        duration: duration / 2,
      },
      callback
    );
  }

onClick('fly-to-origin', function(){
    flyTo(origin_loc, function(){});
})

onClick('fly-to-michigan', function(){
    flyTo(michigan_loc, function(){});
})
