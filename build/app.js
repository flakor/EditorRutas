/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/build/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 9);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

var express = __webpack_require__(4);

var app = express();

var bodyParser = __webpack_require__(2);

var morgan = __webpack_require__(7);

var request = __webpack_require__(8);

var fs = __webpack_require__(5);

var GeoJSON = __webpack_require__(6);

var api = __webpack_require__(3);

var apiConfig = __webpack_require__(1);

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
api.setConfig(apiConfig);
app.set('port', process.env.PORT || 5000);
app.use(express.static(__dirname + '/public')); // views is directory for all template files

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.get('/', function (req, res, next) {
  var json_data = [];
  api.callService("buscaQthUltimoZarpe", "GET", "application/json", {
    "IdMovil": 13439
  }).then(function (p) {
    var p = JSON.stringify(p);
    var json = JSON.parse(p);
    var geojson = {};
    geojson['type'] = 'FeatureCollection';
    geojson['features'] = [];

    for (var k in json.Respuestas.Respuesta) {
      var newFeature = {
        "type": "Feature",
        "properties": {
          "id": "urn:earthquake-usgs-gov:us:2010yfby",
          "date": json.Respuestas.Respuesta[k].fechaQth,
          "clase": "QTH"
        },
        "geometry": {
          "type": "Point",
          "coordinates": [parseFloat(json.Respuestas.Respuesta[k].latitud), parseFloat(json.Respuestas.Respuesta[k].longitud)]
        }
      };
      geojson['features'].push(newFeature);
      console.log(parseFloat(json.Respuestas.Respuesta[k].latitud));
    }

    console.log(JSON.stringify(geojson)); // res.render('pages/index');
    // res.setHeader('content-type', 'application/json');
    // res.end(JSON.stringify(geojson));
  }).catch(function (err) {
    console.error(JSON.stringify(err) + " ----error----");
    console.error(err); // res.setHeader('content-type', 'text/html');
    // res.end(JSON.stringify('no existe informacion con esa fecha'));
  }); //   var actual_JSON;
  //   fs.readFile('public/data/rutas.json', 'utf8', function (err, data) {
  //     if (err) throw err;
  //       actual_JSON = JSON.parse(data);
  //
  // /////////////////////////////////////QTH
  //         actual_JSON.features = actual_JSON.features.filter(function (feature) {
  //           return (feature.properties.clase == 'QTH');
  //         })
  //
  //         var content = JSON.stringify(actual_JSON);
  //
  //           fs.writeFile("public/data/rutasQth.json", content, 'utf8', function (err) {
  //               if (err) {
  //                   return console.log(err);
  //               }
  //
  //               console.log("The file QTH Json was saved!");
  //           });
  //   //////////////////////////////////NORMAL
  //         actual_JSON = JSON.parse(data);
  //         actual_JSON.features = actual_JSON.features.filter(function (feature) {
  //           return (feature.properties.clase == 'Normal');
  //         })
  //
  //         var content = JSON.stringify(actual_JSON);
  //
  //           fs.writeFile("public/data/rutasNormal.json", content, 'utf8', function (err) {
  //               if (err) {
  //                   return console.log(err);
  //               }
  //
  //               console.log("The file Normal Json was saved!");
  //           });
  //         console.log(actual_JSON);
  //
  //   });

  res.render('pages/index');
});
app.listen(app.get('port'), function () {
  console.log('Node app is running on port', app.get('port'));
});

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = {"tokenUrl":"http://172.16.0.128:8280/token","servicesBaseURL":"https://172.16.0.128:8243/","consumerKey":"FqB1DGtw_bwfQu6x3fq0CQ2QiJga","consumerSecret":"m1fASO2uQwGeDNgZMYYsU3P_BzUa","services":{"buscaQTH":"MovilesInternet/1.0.0/buscaQTH"}}

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("body-parser");

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require("dgtm-clienteAPI");

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require("express");

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = require("geojson");

/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = require("morgan");

/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = require("request");

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(0);


/***/ })
/******/ ]);