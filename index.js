var stepford = require('stepford');
var fs = require('fs');
var path = require('path');
var promisify = require('@quarterto/promisify');

var writeFile = promisify(fs.writeFile);

module.exports = function(filename, options) {
	console.assert(path.extname(filename) === '.json', 'expected .json, got ' + path.extname(filename));

	var transactions = [];
	try {
		transactions = require(path.resolve(filename));
	} catch(e) {}

	var latest = transactions.reduce(function(l, tx) {
		return new Date(Math.max(l, new Date(tx.date)));
	}, 0);

	console.log(latest);

	if(latest > 0) {
		options.earliest = latest; // eh whatever
	}

	return stepford(options).then(function(newTx) {
		var allTx = transactions.concat(newTx).sort(function(t1, t2) {
			return t1.date - t2.date;
		});

		return writeFile(filename, JSON.stringify(allTx), 'utf-8');
	});
};
