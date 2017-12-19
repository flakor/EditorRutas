// 'use strict';

// var fs = require('fs');


var urlJson = '/data/rutas.json';
var urlJsonQth = '/data/qth.json';

function loadJSON(callback) {

  var xobj = new XMLHttpRequest();
  xobj.overrideMimeType("application/json");
  xobj.open('GET', urlJson, true); // Replace 'my_data' with the path to your file
  xobj.onreadystatechange = function() {
    if (xobj.readyState == 4 && xobj.status == "200") {
      // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
      callback(xobj.responseText);
    }
  };
  xobj.send(null);
}

loadJSON(function(response) {

  /**
   * Elements that make up the popup.
   */
  var container = document.getElementById('popup');
  var content = document.getElementById('popup-content');
  var closer = document.getElementById('popup-closer');
  var btnCancelar = document.getElementById('delete');
  var btnSave = document.getElementById('save');
  var btnClose = document.getElementById('close');


  /**
   * Create an overlay to anchor the popup to the map.
   */
  var overlay = new ol.Overlay( /** @type {olx.OverlayOptions} */ ({
    element: container,
    autoPan: true,
    autoPanAnimation: {
      duration: 250
    }
  }));


  /**
   * Add a click handler to hide the popup.
   * @return {boolean} Don't follow the href.
   */


  var actual_JSON = JSON.parse(response);

  var coordStringJson = actual_JSON.features[actual_JSON.features.length - 1].geometry.coordinates;
  var coordJson = actual_JSON.features;
  var coordOri = [];
  var coords = [];

  for (var prop in coordStringJson) {
    coords.push(coordStringJson[prop]);
  }

  // var coords = [[-11.0700, 43.8012], [-11.4800, 35.7600],[-20.2800, 23.4100],[-20.0700, 6.9001],[-13.7912, 2.9300],[-5.9100, 1.2600]];

  var pointQth = new ol.source.Vector({
    url: urlJsonQth,
    format: new ol.format.GeoJSON()
  });

  var pointNormal = new ol.source.Vector({
    url: urlJson,
    format: new ol.format.GeoJSON()
  });
  var pointNormalOri = pointNormal;

  var lineString = new ol.geom.LineString(coords);
  // transform to EPSG:3857
  lineString.transform('EPSG:4326', 'EPSG:3857');

  // create the feature
  var feature = new ol.Feature({
    geometry: lineString,
    name: 'Line'
  });

  var source = new ol.source.Vector({
    features: [feature]
  });

  // create the styles
  var lineStyle = new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: 'red',
      width: 2
    })
  });

  var pointStyleNormal = new ol.style.Style({
    image: new ol.style.Circle({
      radius: 5,
      fill: new ol.style.Fill({
        color: 'red'
      }),
      stroke: new ol.style.Stroke({
        color: '#000000'
      })
    })
  });

  var pointStyleQth = new ol.style.Style({
    image: new ol.style.Circle({
      radius: 5,
      fill: new ol.style.Fill({
        color: 'yellow'
      }),
      stroke: new ol.style.Stroke({
        color: '#000000'
      })
    })
  });

  //create MAP TILE
  var raster = new ol.layer.Tile({
    title: 'Global Imagery',
    source: new ol.source.TileWMS({
      url: 'https://ahocevar.com/geoserver/wms',
      params: {
        LAYERS: 'nasa:bluemarble',
        TILED: true
      }
      // source: new ol.source.MapQuest({layer: 'sat'})
    })
  });


  // Crea los vectores
  var vector = new ol.layer.Vector({
    source: source,
    style: [lineStyle]
  });


  var puntosQth = new ol.layer.Vector({
    name: 'PointQth',
    source: pointQth,
    style: [pointStyleQth]
  });

  var puntosNormal = new ol.layer.Vector({
    name: 'PointNormal',
    source: pointNormal,
    style: [pointStyleNormal]
  });


  // console.log(puntos);

  var app = {};

  app.transCoord = function(coordenadasReales) {

    coordenadasReales = ol.proj.transform(coordenadasReales, 'EPSG:3857', 'EPSG:4326');
    var stringifyFunc = ol.coordinate.createStringXY(4);
    var out = stringifyFunc(coordenadasReales);
    var res = out.split(",");
    return res;

  }
  /**
   * @constructor
   * @extends {ol.interaction.Pointer}
   */
  app.Drag = function() {

    ol.interaction.Pointer.call(this, {
      handleDownEvent: app.Drag.prototype.handleDownEvent,
      handleDragEvent: app.Drag.prototype.handleDragEvent,
      handleMoveEvent: app.Drag.prototype.handleMoveEvent,
      handleUpEvent: app.Drag.prototype.handleUpEvent
    });

    /**
     * @type {ol.Pixel}
     * @private
     */
    this.coordinate_ = null;

    /**
     * @type {string|undefined}
     * @private
     */
    this.cursor_ = 'pointer';

    /**
     * @type {ol.Feature}
     * @private
     */
    this.feature_ = null;

    /**
     * @type {string|undefined}
     * @private
     */
    this.previousCursor_ = undefined;

  };
  ol.inherits(app.Drag, ol.interaction.Pointer);


  /**
   * @param {ol.MapBrowserEvent} evt Map browser event.
   * @return {boolean} `true` to start the drag sequence.
   */
  app.Drag.prototype.handleDownEvent = function(evt) {
    var map = evt.map;
    var element = evt.map.getTargetElement();
    var feature = map.forEachFeatureAtPixel(evt.pixel,
      function(feature) {
        //  console.log(feature.getProperties());

        return feature;
      });

    if (feature) {


      if (feature.getGeometry().getType() == 'LineString') {

        this.coordinate_ = evt.coordinate;
        this.feature_ = feature;
        var coordenadasReales = evt.coordinate;
        app.addNewPoint(coordenadasReales, feature);
        return !feature;
      }

      this.coordinate_ = evt.coordinate;
      this.feature_ = feature;
      var res = app.transCoord(this.feature_.getGeometry().getCoordinates());
      var lonOri = parseFloat(res[0]);
      var latOri = parseFloat(res[1]);
      out = [lonOri, latOri]
      coordOri.push(out);

    }

    return !!feature;
  };


  /**
   * @param {ol.MapBrowserEvent} evt Map browser event.
   */
  app.Drag.prototype.handleDragEvent = function(evt) {


    var deltaX = evt.coordinate[0] - this.coordinate_[0];
    var deltaY = evt.coordinate[1] - this.coordinate_[1];

    var geometry = /** @type {ol.geom.SimpleGeometry} */
      (this.feature_.getGeometry());
    geometry.translate(deltaX, deltaY);

    this.coordinate_[0] = evt.coordinate[0];
    this.coordinate_[1] = evt.coordinate[1];



  };


  /**
   * @param {ol.MapBrowserEvent} evt Event.
   */
  app.Drag.prototype.handleMoveEvent = function(evt) {
    if (this.cursor_) {
      var map = evt.map;
      var feature = map.forEachFeatureAtPixel(evt.pixel,
        function(feature) {
          return feature;
        });
      var element = evt.map.getTargetElement();
      if (feature) {
        if (element.style.cursor != this.cursor_) {
          this.previousCursor_ = element.style.cursor;
          element.style.cursor = this.cursor_;
        }
      } else if (this.previousCursor_ !== undefined) {
        element.style.cursor = this.previousCursor_;
        this.previousCursor_ = undefined;
      }
    };
  };


  /**
   * @return {boolean} `false` to stop the drag sequence.
   */

  app.Drag.prototype.handleUpEvent = function(evt) {
    var map = evt.map;
    var element = evt.map.getTargetElement();
    var feature = map.forEachFeatureAtPixel(evt.pixel,
      function(feature) {
        return feature;
      });

    if (feature) {

      this.feature_ = feature;
      var res = app.transCoord(this.feature_.getGeometry().getCoordinates());
      var lonNew = parseFloat(res[0]);
      var latNew = parseFloat(res[1]);
      app.pintar(lonNew, latNew, source);

    }
    // console.log(coords); // NUEVAS COORDENADAS
    return !!feature;
  };



  app.addFeatures = function() {
    var feature, features = [];
    var lineString = new ol.geom.LineString(coords);
    // transform to EPSG:3857
    lineString.transform('EPSG:4326', 'EPSG:3857');

    // create the feature
    var feature = new ol.Feature({
      geometry: lineString,
      name: 'Line'
    });


    features.push(feature);


    source.addFeatures(features);

    return features;
  }

  app.borrar = function(lonNew, latNew, sourceVector, feature) {

    for (var i = 0; i < coords.length; i += 1) {
      if ((coords[i]['0'] === lonNew) && (coords[i]['1'] === latNew)) {
        coords.splice(i, 1);
        puntosNormal.getSource().removeFeature(feature);
        app.pintar(lonNew, latNew, sourceVector);
        return true;

      }
    }
  }

  app.pintar = function(lonNew, latNew, sourceVector) {

    var hash = {};
    for (var i = 0; i < coords.length; i += 1) {
      hash[coords[i]] = i;
    }

    var val = coordOri;
    if (hash.hasOwnProperty(val)) {
      coords[hash[val]] = [lonNew, latNew];
    }


    sourceVector.clear(true);
    coordOri = [];
    app.addFeatures();

  }

  app.addNewPoint = function(coordenadasReales, feature) {


    var res = app.transCoord(coordenadasReales);
    var lonNew = parseFloat(res[0]);
    var latNew = parseFloat(res[1]);

    var newPoint = new ol.Feature({
      geometry: new ol.geom.Point([coordenadasReales[0], coordenadasReales[1]]),
      id: "urn:earthquake-usgs-gov:us:2010yfbn",
      clase: 'Normal'

    });

    var geometry = feature.getGeometry();
    var coordinates = geometry.getCoordinates();
    var startCoord = geometry.getFirstCoordinate();
    var endCoord = geometry.getLastCoordinate();
    var i = 0;
    segment = new Array();
    geometry.forEachSegment(function(startCoord, endCoord) {
      waylinexy = new Array();
      waylinexy.push(startCoord);
      waylinexy.push(endCoord);
      segment.push(new ol.Feature({
        geometry: new ol.geom.LineString(waylinexy, 'XY')
      }));
      i++;

    });

    var dist = [];
    var startCoordSegment = [];
    var endCoordSegment = [];
    for (var j = 0; j < i; j += 1) {

      var geometrySegment = segment[j].getGeometry();
      startCoordSegment.push(geometrySegment.getFirstCoordinate());
      endCoordSegment.push(geometrySegment.getLastCoordinate());
      var res = app.transCoord(startCoordSegment[j]);
      var lonNewStart = parseFloat(res[0]);
      var latNewStart = parseFloat(res[1]);
      var res = app.transCoord(endCoordSegment[j]);
      var lonNewEnd = parseFloat(res[0]);
      var latNewEnd = parseFloat(res[1]);
      var linestring1 = turf.lineString([
        [lonNewStart, latNewStart],
        [lonNewEnd, latNewEnd]
      ]);
      var pt1 = turf.point([lonNew, latNew]);

      dist.push(turf.pointOnLine(linestring1, pt1).properties.dist);



    }

    var intersection = turf.pointOnLine(linestring1, pt1);
    var min = Math.min.apply(null, dist);
    console.log('esta en el segmento' + dist.indexOf(min) + '*******');
    console.log(startCoordSegment[dist.indexOf(min)]);
    var res = app.transCoord(startCoordSegment[dist.indexOf(min)]);
    var lonNewStart = parseFloat(res[0]);
    var latNewStart = parseFloat(res[1]);

    coordenadasStart = new Array();
    coordenadasStart = [lonNewStart, latNewStart];
    coordenadasNew = new Array();
    coordenadasNew = [lonNew, latNew];


    var pos = 0;
    for (var k = 0; k < coords.length; k += 1) {

      if (coords[k].toString() == coordenadasStart.toString()) {

        pos = k;
      }
    }
    coords.splice(pos + 1, 0, coordenadasNew);

    //add feature to centre of map
    puntosNormal.getSource().addFeature(newPoint);
    return true;
  }



  $(document).ready(function() {

    $("#myModal").modal('show');

    $("#myModal").on('shown.bs.modal', function(e) {
      // do something...
      // console.log("entro");
      initMap();
    })
  });




  var draw = new app.Drag();

  var mousePosition = new ol.control.MousePosition({
    coordinateFormat: ol.coordinate.createStringXY(2),
    projection: 'EPSG:4326',
    target: document.getElementById('myposition'),
    undefinedHTML: '&nbsp;'
  });

  // Carga todo en el MAP

  function initMap() {
    var map = new ol.Map({
      interactions: ol.interaction.defaults({
        doubleClickZoom: false
      }),
      overlays: [overlay],
      layers: [raster, vector, puntosNormal, puntosQth],
      target: 'map',
      view: new ol.View({
        center: [0, 0],
        zoom: 3
      })
    });


    map.addInteraction(draw);
    map.addControl(mousePosition);

    map.on("dblclick", function(evt) {

      var feature = map.forEachFeatureAtPixel(evt.pixel,
        function(feature) {

          if (feature.getProperties().clase == 'Normal') {
            this.coordinate_ = evt.coordinate;
            this.feature_ = feature;
            var res = app.transCoord(this.feature_.getGeometry().getCoordinates());
            var lonNew = parseFloat(res[0]);
            var latNew = parseFloat(res[1]);
            app.borrar(lonNew, latNew, source, feature);

          }
          if (feature.getProperties().clase == 'QTH') {

            var coordinate = evt.coordinate;
            var hdms = feature.getProperties().date
            content.innerHTML = '<p>QTH <code>' + hdms + '</code>';
            overlay.setPosition(coordinate);

          }
          return true;
        });

    });

    map.on('pointermove', function(evt) {
      var dragStatus;
      var dragActive;
      var feature = map.forEachFeatureAtPixel(evt.pixel,
        function(feature) {


          if (feature.getProperties().clase == 'QTH') {

            dragStatus = 1;
          }
          if (feature == undefined) {
            dragStatus = 0;
          }

          if (dragStatus == 1) {
            map.removeInteraction(draw);
            dragActive = 1;
          }

        });

    });


    // clears the map and the output of the data

    btnCancelar.onclick = function() {


      swal({
        title: 'Esta seguro?',
        text: "Descartar Modificaciones en la ruta.",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si, Descartar!'
      }).then((result) => {
        if (result.value) {
          puntosNormal.getSource().getFeatures()
          vector.getSource().getFeatures()
          puntosNormal.getSource().clear();
          vector.getSource().clear();
          coords = []
          for (var prop in coordStringJson) {

            coords.push(coordStringJson[prop]);

          }
          app.addFeatures();
          swal(
            'Ruta modificada ha sido descartada!',
            'La ruta ha sido recargada con datos originales.',
            'success'
          )
        }
      })

      return true;
    }

    btnSave.onclick = function() {
      feature = []
      format = new ol.format.GeoJSON({
        featureProjection: 'EPSG:3857'
      });
      featurePoint = puntosNormal.getSource().getFeatures();
      featureLine = vector.getSource().getFeatures();
      pointNormal.forEachFeature(function(featurePoint) {
        if (featurePoint.getGeometry().getType() == 'Point') {
          feature.push(featurePoint);
        }
      });
      source.forEachFeature(function(featureLine) {
        if (featureLine.getGeometry().getType() == 'LineString') {
          feature.push(featureLine);
        }
      });

      data = format.writeFeatures(feature, {
        decimals: 4
      });
      console.log(data);
      swal({
        position: 'top-right',
        type: 'success',
        title: 'La nueva ruta ha sido guardada.',
        showConfirmButton: false,
        timer: 1500
      })
      return true;


    }
    closer.onclick = function() {
      overlay.setPosition(undefined);
      closer.blur();
      map.addInteraction(draw);
      return false;
    };

    btnClose.onclick = function() {
      feature = []
      format = new ol.format.GeoJSON({
        featureProjection: 'EPSG:3857'
      });
      featurePoint = puntosNormal.getSource().getFeatures();
      featureLine = vector.getSource().getFeatures();
      pointNormal.forEachFeature(function(featurePoint) {
        if (featurePoint.getGeometry().getType() == 'Point') {
          feature.push(featurePoint);
        }
      });
      source.forEachFeature(function(featureLine) {
        if (featureLine.getGeometry().getType() == 'LineString') {
          feature.push(featureLine);
        }
      });

      var data = format.writeFeatures(feature, {
        decimals: 4
      });
      // console.log(data);
      var puntosOriginales = coordStringJson.length;
      var puntosModificados = featurePoint.length - 1;

      if (puntosOriginales === puntosModificados) {
        console.log('sin cambios');
        $("#myModal").modal("hide");
      } else if (puntosOriginales != puntosModificados) {
        swal({
          title: 'Tiene cambios pendientes.',
          text: "Esta seguro que desea descartarlos?.",
          type: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'No, Guardar Cambios!',
          cancelButtonText: 'Si, Descartar!',
          confirmButtonClass: 'btn btn-success',
          cancelButtonClass: 'btn btn-danger',
          buttonsStyling: false
        }).then((result) => {
          if (result.value) {
            console.log(data);
            swal(
              'Ruta Guardada!',
              'La nueva ruta ha sido guardada.',
              'success'
            ).then(function() {
              // Redirect the user
              console.log('The Ok Button was clicked.');
              $("#myModal").modal("hide");
              window.location.href = "http://localhost:5000";
            });
            // result.dismiss can be 'cancel', 'overlay',
            // 'close', and 'timer'
          } else if (result.dismiss === 'cancel') {
            puntosNormal.getSource().getFeatures()
            vector.getSource().getFeatures()
            puntosNormal.getSource().clear();
            vector.getSource().clear();
            coords = []
            for (var prop in coordStringJson) {

              coords.push(coordStringJson[prop]);

            }
            app.addFeatures();
            swal({
              type: 'error',
              title: 'Ruta Descartada',
              text: 'La nueva ruta ha sido descartada.',
              showConfirmButton: true
            }).then(function() {
              // Redirect the user
              // window.location.href = "new_url.html";
              console.log('The Ok Button was clicked.');
              $("#myModal").modal("hide");
              window.location.href = "http://localhost:5000";
            });



          }

        })

      }

      return true;
    };


  }

});
