var ESProxy = require('./lib/elasticsearch-proxy').ESProxy,
	sys = require('sys');

sys.puts("Routing 9200 to 9210")
new ESProxy({
	'proxyPort': 9200,
	'elasticSearchPort': 9210,
	'maximumOpenIndices': 5
});