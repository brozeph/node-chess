var algebraic = require('./algebraicGameClient.js'),
	simple = require('./simpleGameClient.js');

// exports
module.exports = {
	create : function() {
		return algebraic.create();
	},
	createSimple : function() {
		return simple.create();
	}
};