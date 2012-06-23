var ESProxy = require('./lib').ESProxy,
	util = require('util');

util.puts("Routing 9201 to 9200")
new ESProxy({
	'proxyPort': 9201,
	'elasticSearchPort': 9200
});
