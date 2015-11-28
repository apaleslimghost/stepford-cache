var stepford = require('stepford');
var fs = require('fs');
var path = require('path');
var promisify = require('@quarterto/promisify');
var hash = require('object-hash');

var writeFile = promisify(fs.writeFile);

function toObject(tx) {
	var out = {};
	tx.forEach(function(t) {
		out[hash(t)] = t;
	});
	return out;
}

function values(obj) {
	return Object.keys(obj).map(k => obj[k])
}

module.exports = function(filename, options) {
	console.assert(path.extname(filename) === '.json', 'expected .json, got ' + path.extname(filename));

	var transactions = [];
	try {
		transactions = require(path.resolve(filename));
	} catch(e) {}

	var latest = transactions.reduce(function(l, tx) {
		return new Date(Math.max(l, new Date(tx.date)));
	}, 0);

	var txObj = toObject(transactions);

	if(latest > 0) {
		options.earliest = latest; // eh whatever
	}

	return stepford(options).then(function(newTx) {
		var allTx = values(Object.assign(txObj, toObject(newTx)));
		return writeFile(filename, JSON.stringify(allTx), 'utf-8');
	});
};
