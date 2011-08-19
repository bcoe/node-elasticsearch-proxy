var sys = require('sys'),
	ElasticSearch = require('./elasticsearch').ElasticSearch;

exports.Cache = function(params) {
	this.indicesHash = {};
	this.indicesList = [];
	this.maximumOpenIndices = params.maximumOpenIndices;
	this.elasticsearch = new ElasticSearch({
		'elasticSearchPort': params.elasticSearchPort
	});
};

exports.Cache.prototype.add = function(index) {
	if (!this.indicesHash[index]) {
		this.indicesHash[index] = true;
		this.indicesList.push(index);
	}
	
	if (this.indicesList.length > this.maximumOpenIndices) {
		var indexToDelete = this.indicesList.shift();
		delete this.indicesHash[indexToDelete];
		this.elasticsearch.close(indexToDelete);
	}
	
	sys.puts(JSON.stringify(this.indicesList));
};