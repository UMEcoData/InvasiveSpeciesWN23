import './map_style.css';
import KML from 'ol/format/KML.js';
import {Map, View, Feature} from 'ol';
import { Point } from 'ol/geom';
import {
    Circle as CircleStyle,
    Fill,
    RegularShape,
    Stroke,
    Style,
    Icon,
    Text,
  } from 'ol/style.js';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import {fromLonLat} from 'ol/proj.js';
import {transform} from 'ol/proj.js';
import {Vector as VectorLayer} from 'ol/layer.js';
import {Cluster, Stamen, Vector as VectorSource} from 'ol/source.js';
import {
    Select,
    defaults as defaultInteractions,
  } from 'ol/interaction.js';
import {Heatmap as HeatmapLayer} from 'ol/layer.js';

/*
Possible Additional Features
https://openlayers.org/en/latest/examples/icon.html
1. Pinned Location on where they were first found
2. Restaurants serving this species

EDDMapS. 2023. Early Detection & Distribution Mapping System. The University of Georgia - Center for Invasive Species and Ecosystem Health. Available online at http://www.eddmaps.org/; last accessed March 7, 2023.
*/


// Optional variables to make dict easier
const michigan_loc = fromLonLat([-84, 45])
const london_loc = fromLonLat([-0.12755, 51.507222])

// Variables to customise main.js file for each Species
const page_dict = {
    "/SpeciesPages/RoundGoby.html": {
        "kml_data": "roundgoby.kml",
        "invasive_loc": michigan_loc,
        "origin_loc": london_loc,
        "invasive_zoom": 5.7,
        "origin_zoom": 5.7,
    }, 
    "/SpeciesPages/ZebraQuaggaMussels.html": {
        "kml_data": "roundgoby.kml",
        "invasive_loc": michigan_loc,
        "origin_loc": london_loc,
        "invasive_zoom": 5.7,
        "origin_zoom": 5.7,
    }, 

}

// Initialize variables for species map
const currentPage = window.location.pathname
const species_dict = page_dict[currentPage]

const invasive_loc = species_dict["invasive_loc"] // fromLonLat([-0.12755, 51.507222]);
const origin_loc = species_dict["origin_loc"] // fromLonLat([-84, 45]);
const kml_data = species_dict["kml_data"]
const invasive_zoom = species_dict["invasive_zoom"]
const origin_zoom = species_dict["origin_zoom"]
  


const view = new View({
    center: invasive_loc,
    zoom: invasive_zoom
});

const blur = document.getElementById('blur');
const radius = document.getElementById('radius');

const vector = new HeatmapLayer({
    source : new VectorSource({
        url: "/geoData/".concat(kml_data),
        format: new KML(),
    }),
    declutter : true,
  });

const raster = new TileLayer({
    source: new OSM(),
  });

const map = new Map({
  target: 'map',
  layers: [raster, vector],
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
        zoom: 5.7,
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
    flyTo(invasive_loc, function(){});
})

blur.addEventListener('input', function () {
    vector.setBlur(parseInt(blur.value, 10));
  });
  
  radius.addEventListener('input', function () {
    vector.setRadius(parseInt(radius.value, 10));
  });