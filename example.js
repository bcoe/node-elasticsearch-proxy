var ESProxy = require('./lib').ESProxy,
	sys = require('sys');

sys.puts("Routing 9201 to 9200")
new ESProxy({
	'proxyPort': 9201,
	'elasticSearchPort': 9200
});
