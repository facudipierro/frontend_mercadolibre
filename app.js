var Twig = require("twig");
var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: true });

Twig.extendFunction("split_money", function(value) {
	var price = value.toString().split(".")[0];
	var decimals = value.toString().split(".")[1];
	if (decimals){
		return price+"<span>"+decimals+"</span>";
	}else{
		return price;
	}
});

var app = express();

// This section is optional and used to configure twig. 
app.set("twig options", {
    strict_variables: false
});

// Just a visit counter
var nbVisits = 0;

app.set('view engine', 'twig');

app.get('/', function(req, res) {
    nbVisits++;
    res.render('index.twig', {
       visits: nbVisits
    });
});

app.get('/items', urlencodedParser, function(req, res) {
	var search_txt = req.query.search;
	
	request.get('https://api.mercadolibre.com/sites/MLA/search?q='+search_txt, function(err, response) {
		if (err) {
			res.render('error.twig');
		} else {
			var respuesta = JSON.parse(response.body);
			res.render('listado.twig', {
				productos: respuesta.results.slice(0, 4)
			});
		}
	});
});

app.get('/items/:id_producto', urlencodedParser, function(req, res) {
	var idProducto = req.params.id_producto;
	request.get("https://api.mercadolibre.com/items/"+idProducto, function(err, responseArticulo) {
		if (err) {
			res.render('error.twig');
		} else {
			request.get("https://api.mercadolibre.com/items/"+idProducto+"/description", function(err, responsePublicacion) {
				if (err) {
					res.render("error.twig");
				} else {
					var articulo = JSON.parse(responseArticulo.body);
					var publicacion = JSON.parse(responsePublicacion.body);
					res.render("detalle.twig", {
						producto: articulo,
						publicacion: publicacion
					});
				}
			});
		}
	});
});

app.use(express.static('assets'));

app.listen(8080);