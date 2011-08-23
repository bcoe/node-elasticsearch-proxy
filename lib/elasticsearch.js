var http = require('http'),
	sys = require('sys');

exports.ElasticSearch = function(params) {
	this.elasticSearchPort = params.elasticSearchPort;
	this.response = params.response;
};

exports.ElasticSearch.prototype.open = function(indexName) {
	var client = http.createClient(this.elasticSearchPort, 'localhost'),
		_this = this;
	
	_this.response.attachErrorHandling( client );
	
	var request = client.request('POST', '/' + indexName + '/_open');
	request.end();
};

exports.ElasticSearch.prototype.close = function(indexName) {
	var client = http.createClient(this.elasticSearchPort, 'localhost'),
		_this = this;
	
	_this.response.attachErrorHandling( client );
	
	var request = client.request('POST', '/' + indexName + '/_close');
	request.end();
};