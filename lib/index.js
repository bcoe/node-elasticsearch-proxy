var util = require('util'),
	http = require('http'),
	Response = require('./response').Response;
	
exports.ESProxy = function(params) {
	
	var server = http.createServer(function(req, res) {
		new Response({
			'req': req,
			'res': res,
			'elasticSearchPort': params.elasticSearchPort
		});	
	}).listen(params.proxyPort);
	
};