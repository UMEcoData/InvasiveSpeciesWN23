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
import Overlay from 'ol/Overlay.js';
import OSM from 'ol/source/OSM';
import {transform} from 'ol/proj.js';
import {Vector as VectorLayer} from 'ol/layer.js';
import {Cluster, Stamen, Vector as VectorSource} from 'ol/source.js';
import {
    Select,
    defaults as defaultInteractions,
  } from 'ol/interaction.js';
import {Heatmap as HeatmapLayer} from 'ol/layer.js';

import {toStringHDMS} from 'ol/coordinate.js';
import {fromLonLat, toLonLat} from 'ol/proj.js';
import * as bootstrap from 'bootstrap';
window.bootstrap = bootstrap;

/*
Possible Additional Features
https://openlayers.org/en/latest/examples/icon.html
1. Pinned Location on where they were first found
2. Restaurants serving this species

EDDMapS. 2023. Early Detection & Distribution Mapping System. The University of Georgia - Center for Invasive Species and Ecosystem Health. Available online at http://www.eddmaps.org/; last accessed March 7, 2023.
*/

// https://mygeodata.cloud/converter/


// Optional variables to make dict easier
const michigan_loc = fromLonLat([-84, 45])
const london_loc = fromLonLat([-0.12755, 51.507222])
const goby_origin_loc = fromLonLat([41.0, 42.0])
const atlantic_coast_loc = fromLonLat([-61, 37.5])
const quagga_blacksea_origin = fromLonLat([34.2993, 43.413])
// const quagga_caspian_origin = fromLonLat([])


// Variables to customise main.js file for each Species
/*
NEW: markers list of dictionaries
notice how id number matches
 <img src="/Icons/pin.png" id="marker0" class="marker" />
see RoundGoby.html for format
*/

/*
Usage
42 55' 44" N
84 33' 29" W
would correspond to a long_lat array of [-84.3329, 42.5544]

N and E are positive
S and W are negative

N/S correspond to long_lat[1]
E/W correspond to long_lat[0]
*/
const page_dict = {
    "/SpeciesPages/RoundGoby.html": {
        "kml_data": ["roundgoby.kml", "test_data.kml"],
        "kml_gradient": [['#f00', '#ff0', '#0f0', '#0ff', '#00f'], ['#00f', '#0ff', '#0f0', '#ff0', '#f00']],
        "invasive_loc": michigan_loc,
        "origin_loc": goby_origin_loc,
        "invasive_zoom": 5.3,
        "origin_zoom": 5,
        "markers": [
            {
                "id": "marker0",
                "long_lat": [-82.5, 42.8],
                "text": "The Round Goby was first discovered to have been introduced to the Great Lakes in 1990 by fishermen in the St Clair River",
                "link": "https://nyis.info/invasive_species/round-goby/#:~:text=The%20round%20goby%20(Neogobius%20melanostomus,Clair%20River."
            },
            {
                "id": "marker1",
                "long_lat": [-86.3103, 42.3446],
                "text": "Round Gobies are excellent bait theives, so they are a nuissance to anglers.",
                "link": "https://nyis.info/invasive_species/round-goby/#:~:text=The%20round%20goby%20(Neogobius%20melanostomus,Clair%20River."
            },
            {
                "id": "marker2",
                "long_lat": [-79.3812, 43.0133],
                "text": "Some researchers have highlighted the possibility that there is a link between Type E avian botulism outbreaks and the Round Goby within Lakes Erie and Ontario.",
                "link": "https://nyis.info/invasive_species/round-goby/#:~:text=The%20round%20goby%20(Neogobius%20melanostomus,Clair%20River."
            },
            {
                "id": "marker3",
                "long_lat": [50, 50],
                "text": "Hello from marker 3!",
                "link": ""
            }
        ]
    }, 
    "/SpeciesPages/ZebraQuaggaMussels.html": {
        "kml_data": ["quagga_mussel.kml"],
        "invasive_loc": michigan_loc,
        "origin_loc": quagga_blacksea_origin,
        "invasive_zoom": 5.7,
        "origin_zoom": 5.7,
        "markers": [
          {
            "id": "og1",
            "long_lat": [34.2993, 43.413],
            "text": "Quagga Mussel Origin 1"
          }
        ]
    }, 
    "/SpeciesPages/Alewife.html": {
      "kml_data": ["alewife.kml"],
      "invasive_loc": michigan_loc,
      "origin_loc": atlantic_coast_loc,
      "invasive_zoom": 5.7,
      "origin_zoom": 5.7,
      "markers": [
        {
            "id": 0,
            "long_lat": [-79.211260, 43.057321],
            "text": "The Alewife spread to Lake Erie and other Great Lakes through the Welland Canal",
            "link": "https://www.invasivespeciesinfo.gov/aquatic/fish-and-other-vertebrates/alewife"
        }
      ]
  }, 

}

// Initialize variables for species map
const currentPage = window.location.pathname
const species_dict = page_dict[currentPage]

// DATA and LOCATIONS
const invasive_loc = species_dict["invasive_loc"] // fromLonLat([-0.12755, 51.507222]);
const origin_loc = species_dict["origin_loc"] // fromLonLat([-84, 45]);
const kml_data_array = species_dict["kml_data"]
const kml_gradient_array = species_dict["kml_gradient"]
const invasive_zoom = species_dict["invasive_zoom"]
const origin_zoom = species_dict["origin_zoom"]
const markers = species_dict["markers"]
console.log(markers)
console.log(species_dict["markers"])

// MAIN MAP RENDERING
const view = new View({
    center: invasive_loc,
    zoom: invasive_zoom
});

const blur = document.getElementById('blur');
const radius = document.getElementById('radius');

const raster = new TileLayer({
    source: new OSM(),
  });

let all_layers = []
all_layers.push(raster)

for (var i = 0; i < kml_data_array.length; i++){
    const vector = new HeatmapLayer({
        source : new VectorSource({
            url: "/geoData/".concat(kml_data_array[i]),
            format: new KML(),
        }),
        gradient: kml_gradient_array[i],
        declutter : true,
      });
      all_layers.push(vector)
}

//all_layers.push(vector)
const map = new Map({
  target: 'map',
  layers: all_layers,
  view: view
});

console.log(map)

function onClick(id, callback) {
    document.getElementById(id).addEventListener('click', callback);
}

// MAP feature of flying to origin location and to Michigan
function flyTo(location, new_zoom, done) {
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
        zoom: new_zoom,
        duration: duration,
      },
      callback
    );
    view.animate(
      {
        zoom: new_zoom - 1,
        duration: duration / 2,
      },
      {
        zoom: new_zoom,
        duration: duration / 2,
      },
      callback
    );
  }

// MAP feature of flying to origin location and to Michigan
onClick('fly-to-origin', function(){
    flyTo(origin_loc, origin_zoom, function(){});
})

onClick('fly-to-michigan', function(){
    flyTo(invasive_loc, invasive_zoom, function(){});
})

// MAP feature of bluring and formating kml data size
blur.addEventListener('input', function () {
    for (var i = 1; i < all_layers.length; i++){
        all_layers[i].setBlur(parseInt(blur.value, 10));
    }
    // vector.setBlur(parseInt(blur.value, 10));
  });
  
  radius.addEventListener('input', function () {
    for (var i = 1; i < all_layers.length; i++){
        all_layers[i].setRadius(parseInt(radius.value, 10));
    }
   //  vector.setRadius(parseInt(radius.value, 10));
  });

/*
// MAP feature of adding pop ups
// useful helper to get Long_lat
const coord_popup = new Overlay({
  element: document.getElementById('long_lat_popup'),
  positioning: 'bottom-center',
  stopEvent: false,
});
map.addOverlay(coord_popup);

// use this as example for techincal task!
const coord_element = coord_popup.getElement();
map.on('click', function (evt) {
    const coordinate = evt.coordinate;
    const hdms = toStringHDMS(toLonLat(coordinate));
    coord_popup.setPosition(coordinate);
    let popover = bootstrap.Popover.getInstance(coord_element);
    if (popover) {
      popover.dispose();
    }
    popover = new bootstrap.Popover(coord_element, {
      animation: false,
      container: coord_element,
      content: '<p>The location you clicked was:</p><code>' + hdms + '</code>',
      html: true,
      placement: 'top',
      title: "[x, y] : North(+)/South(-) = y AND East(+)/West(-) = x ",
    });
    popover.show();
});
  */

// MAP feature: MARKERS !
// https://openlayers.org/en/latest/examples/overlay.html
for (var i = 0; i < markers.length; i++){
    let marker_dict = markers[i]
    const pos = fromLonLat(marker_dict["long_lat"]); //[16.3725, 48.208889]
    const element_id = marker_dict["id"]
    console.log(element_id)
    const marker = new Overlay({
        position: pos,
        positioning: 'center-center',
        element: document.getElementById(element_id),
        stopEvent: false,
    });
  map.addOverlay(marker);

}

const icon_popup = new Overlay({
    element: document.getElementById('icon_popup'),
    positioning: 'bottom-center',
    stopEvent: false,
  });
  map.addOverlay(icon_popup);

const icon_element = icon_popup.getElement()
map.on('click', function (evt) {
    let popover = bootstrap.Popover.getInstance(icon_element);
    if (popover) {
        popover.dispose();
    }
    const coordinate = evt.coordinate;
    const hdms = toStringHDMS(toLonLat(coordinate));
    const LonLat_clicked = toLonLat(coordinate)
    for(let i = 0; i < markers.length; i++){
        if (check_if_clicked(LonLat_clicked, markers[i]) == true){
            icon_popup.setPosition(coordinate);
            popover = new bootstrap.Popover(icon_element, {
            animation: false,
            container: icon_element,
            content: markers[i]["text"],
            html: true,
            placement: 'top',
            title: "Title",
            });
            popover.show();
        }
    }
});
// https://openlayers.org/en/latest/examples/popup.html
// Add on click function to check if a user clicks near a marker +/- 1 degree?
// use the popup code as a reference
// use above map.on('click' ...) as example

function check_if_clicked(clicked_coord, marker){
    const marker_coord = marker["long_lat"]
    const long_dif = Math.abs(clicked_coord[0] - marker_coord[0])
    const lat_dif = Math.abs(clicked_coord[1] - marker_coord[1])
    if (long_dif <= 0.5 & lat_dif <= 0.5){
        return true
    }
   return false
}