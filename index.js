
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan     = require('morgan');
var request 	 = require("request");
var fs 		     = require('fs');
var GeoJSON = require('geojson');
var api = require('dgtm-clienteAPI');
var apiConfig = require('./config.json');
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
api.setConfig(apiConfig);
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));



// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


app.get('/', function(req, res, next) {
var json_data = [];
  api.callService("buscaQthUltimoZarpe", "GET", "application/json",{"IdMovil":13439})
  				.then(function(p) {
  						var p = JSON.stringify(p);
  						var json = JSON.parse(p)
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
                	}
                	geojson['features'].push(newFeature);
                  console.log(parseFloat(json.Respuestas.Respuesta[k].latitud));
                }


              console.log(JSON.stringify(geojson));

              // res.render('pages/index');
  						// res.setHeader('content-type', 'application/json');
  						// res.end(JSON.stringify(geojson));

  				})
  				.catch(function(err) {
  					console.error(JSON.stringify(err) + " ----error----");
  					console.error(err);

  					// res.setHeader('content-type', 'text/html');
  					// res.end(JSON.stringify('no existe informacion con esa fecha'));
  				});





//   var actual_JSON;
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

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
