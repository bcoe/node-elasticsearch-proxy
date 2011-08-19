var http = require('http'),
	sys = require('sys');

exports.ElasticSearch = function(params) {
	this.elasticSearchPort = params.elasticSearchPort;
};

exports.ElasticSearch.prototype.open = function(indexName) {
	var client = http.createClient(this.elasticSearchPort, 'localhost');
	var request = client.request('POST', '/' + indexName + '/_open');
	request.end();
}

exports.ElasticSearch.prototype.close = function(indexName) {
	var client = http.createClient(this.elasticSearchPort, 'localhost');
	var request = client.request('POST', '/' + indexName + '/_close');
	request.end();
}