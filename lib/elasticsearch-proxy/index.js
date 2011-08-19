var sys = require('sys'),
	http = require('http'),
	Response = require('./response').Response,
	Cache = require('./cache').Cache;

exports.ESProxy = function(params) {
	
	var cache = new Cache({
		'maximumOpenIndices': params.maximumOpenIndices,
		'elasticSearchPort': params.elasticSearchPort
	});

	var server = http.createServer(function(req, res) {
		new Response({
			'req': req,
			'res': res,
			'cache': cache,
			'elasticSearchPort': params.elasticSearchPort
		});	
	}).listen(params.proxyPort);
}