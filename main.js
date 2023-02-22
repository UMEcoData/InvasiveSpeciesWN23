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

const origin_loc = fromLonLat([-0.12755, 51.507222]);
const michigan_loc = fromLonLat([-84, 45]);

/*
const earthquakeFill = new Fill({
    color: 'rgba(255, 153, 0, 0.8)',
  });
  const earthquakeStroke = new Stroke({
    color: 'rgba(255, 204, 0, 0.2)',
    width: 1,
  });
  const textFill = new Fill({
    color: '#fff',
  });
  const textStroke = new Stroke({
    color: 'rgba(0, 0, 0, 0.6)',
    width: 3,
  });
  const invisibleFill = new Fill({
    color: 'rgba(255, 255, 255, 0.01)',
  });
  
  function createEarthquakeStyle(feature) {
    // 2012_Earthquakes_Mag5.kml stores the magnitude of each earthquake in a
    // standards-violating <magnitude> tag in each Placemark.  We extract it
    // from the Placemark's name instead.
    const name = feature.get('name');
    const magnitude = parseFloat(name.substr(2));
    const radius = 5 + 20 * (magnitude - 5);
  
    return new Style({
      geometry: feature.getGeometry(),
      image: new RegularShape({
        radius1: radius,
        radius2: 3,
        points: 5,
        angle: Math.PI,
        fill: earthquakeFill,
        stroke: earthquakeStroke,
      }),
    });
  }
  
  let maxFeatureCount;
  let vector = null;
  const calculateClusterInfo = function (resolution) {
    maxFeatureCount = 0;
    const features = vector.getSource().getFeatures();
    let feature, radius;
    for (let i = features.length - 1; i >= 0; --i) {
      feature = features[i];
      const originalFeatures = feature.get('features');
      const extent = createEmpty();
      let j, jj;
      for (j = 0, jj = originalFeatures.length; j < jj; ++j) {
        extend(extent, originalFeatures[j].getGeometry().getExtent());
      }
      maxFeatureCount = Math.max(maxFeatureCount, jj);
      radius = (0.25 * (getWidth(extent) + getHeight(extent))) / resolution;
      feature.set('radius', radius);
    }
  };

let currentResolution;
function styleFunction(feature, resolution) {
  if (resolution != currentResolution) {
    calculateClusterInfo(resolution);
    currentResolution = resolution;
  }
  let style;
  const size = feature.get('features').length;
  if (size > 1) {
    style = new Style({
      image: new CircleStyle({
        radius: feature.get('radius'),
        fill: new Fill({
          color: [255, 153, 0, Math.min(0.8, 0.4 + size / maxFeatureCount)],
        }),
      }),
      text: new Text({
        text: size.toString(),
        fill: textFill,
        stroke: textStroke,
      }),
    });
  } else {
    const originalFeature = feature.get('features')[0];
    style = createEarthquakeStyle(originalFeature);
  }
  return style;
}

function selectStyleFunction(feature) {
    const styles = [
      new Style({
        image: new CircleStyle({
          radius: feature.get('radius'),
          fill: invisibleFill,
        }),
      }),
    ];
    const originalFeatures = feature.get('features');
    let originalFeature;
    for (let i = originalFeatures.length - 1; i >= 0; --i) {
      originalFeature = originalFeatures[i];
      styles.push(createEarthquakeStyle(originalFeature));
    }
    return styles;
  }

  vector = new VectorLayer({
    source: new Cluster({
      distance: 40,
      source: new VectorSource({
        url: '/Geo_data/data.kml/',
        format: new KML({
          extractStyles: false,
        }),
      }),
    }),
    style: styleFunction,
  });
  
*/

const view = new View({
    center: transform([-84, 45], 'EPSG:4326', 'EPSG:3857'),
    zoom: 5.7
});

const blur = document.getElementById('blur');
const radius = document.getElementById('radius');

/*
features : [
        new Feature({ geometry : new Point([ -6005420.749222653, 6000508.181331601 ]) }),
        new Feature({ geometry : new Point([ -6015421.749222653, 6010507.181331601 ]) }),
        new Feature({ geometry : new Point([ -6025422.749222653, 6020506.181331601 ]) }),
        new Feature({ geometry : new Point([ -6035423.749222653, 6030505.181331601 ]) }),
      ],
*/

const vector = new HeatmapLayer({
    source : new VectorSource({
        url: '/Geo_data/data.kml',
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
    flyTo(michigan_loc, function(){});
})

blur.addEventListener('input', function () {
    vector.setBlur(parseInt(blur.value, 10));
  });
  
  radius.addEventListener('input', function () {
    vector.setRadius(parseInt(radius.value, 10));
  });