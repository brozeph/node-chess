var algebraic = require('./algebraicGameClient.js'),
	simple = require('./simpleGameClient.js');

// exports
module.exports = {
	create : function () {
		'use strict';

		return algebraic.create();
	},
	createSimple : function () {
		'use strict';

		return simple.create();
	}
};