var sys = require('sys'),
	http = require('http'),
	ElasticSearch = require('./elasticsearch').ElasticSearch;

exports.Response = function( params ) {
	var _this = this;
	
	this.responded = false;
	this.elasticSearchPort = params.elasticSearchPort;
	this.res = params.res;
	this.req = params.req;
	this.cache = params.cache;
	
	// We try to recover from a failure for
	// a maximum of 5 seconds.
	this.failureCount = 0;
	this.maximumFailures = 25;
	this.failureWait = 100; 
	
	this.indexName = this.getIndexName();
	this.elasticsearch = new ElasticSearch({
		'elasticSearchPort': this.elasticSearchPort
	});
	
	this.loadPostBody(function() {
		_this.cache.add( _this.indexName );
		_this.healingResponse();
	});
};

exports.Response.prototype.getIndexName = function() {
	try {
		return this.req.url.match(/\/([^/]*)/)[1];
	} catch (e) {
		this.forceResponse();
	}
}

exports.Response.prototype.loadPostBody = function(callback) {
	var _this = this;
	if (this.responded) { return; }
	
	this.postBody = '';
	
	this.req.addListener("data", function(chunk) {
		_this.postBody += chunk;
	});
 
	this.req.addListener("end", function() {
		callback();
	});
};

exports.Response.prototype.primeCache = function() {
	if (this.responded) { return; }
};

exports.Response.prototype.proxyRequestToElasticSearch = function() {
	var client = http.createClient(this.elasticSearchPort, 'localhost'),
		headers = {
			'host': 'localhost:' + this.elasticSearchPort,
			'accept-encoding': 'identity'
		};
	
	this.copyRequestHeaders(headers);
		
	var proxyRequest = client.request(this.req.method, this.req.url, headers);	
	if (this.postBody > '') {
		proxyRequest.write(this.postBody);
	}
	proxyRequest.end();
	
	return proxyRequest;
}

exports.Response.prototype.copyRequestHeaders = function(headers) {
	for (var key in this.req.headers) {
		if (this.req.headers.hasOwnProperty(key)) {
			var key = key.toLowerCase();
			if (!headers[key]) {
				headers[key] = this.req.headers[key];
			}
		}
	}
};

exports.Response.prototype.forceResponse = function() {
	var _this = this;
	
	this.responded = true;
	
	var proxyRequest = this.proxyRequestToElasticSearch();
	
	proxyRequest.addListener('response', function(proxyResponse){
		proxyResponse.body = '';
		
		proxyResponse.addListener('data', function(chunk){
			proxyResponse.body += chunk; 
		});
		
		proxyResponse.addListener('end', function(){
			_this.res.write( proxyResponse.body );
			_this.res.end();
		});	
	});
};

exports.Response.prototype.healingResponse = function() {
	var _this = this;
	if (this.failureCount > this.maximumFailures) {
		this.forceResponse();
		return;
	}
	
	var proxyRequest = this.proxyRequestToElasticSearch();
	
	proxyRequest.addListener('response', function(proxyResponse){
		proxyResponse.body = '';
		
		proxyResponse.addListener('data', function(chunk){
			proxyResponse.body += chunk; 
		});
		
		proxyResponse.addListener('end', function(){
			if (!_this.handleElasticSearchResponse( proxyResponse.body )) {
				_this.failureCount += 1;
			}
		});	
	});
}

exports.Response.prototype.handleElasticSearchResponse = function(responseRaw) {
	var _this = this;
	
	try {
		var responseObject = JSON.parse(responseRaw);
		
		if (responseObject.error) {
			
			if (responseObject.error.indexOf('IndexMissingException') !== -1) {
				setTimeout(function() {
					_this.healingResponse();
				}, this.failureWait);
				return false;
			}
			
			if (responseObject.error.indexOf('index closed') !== -1) {
				setTimeout(function() {
					_this.healingResponse();
				}, this.failureWait);
				this.elasticsearch.open(this.indexName);
				return false;
			}
			
			if (responseObject.error.indexOf('shardFailures') !== -1) {
				setTimeout(function() {
					_this.healingResponse();
				}, this.failureWait);
				return false;
			}
			
		}

		_this.res.write( responseRaw );
		_this.res.end();
		return true;
		
	} catch (e) {
		sys.puts(e);
		this.healingResponse();
		return false;
	}
}