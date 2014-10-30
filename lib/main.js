var algebraic = require('./algebraicGameClient.js'),
	simple = require('./simpleGameClient.js');

// exports
module.exports = {
	create : function (opts) {
		'use strict';

		return algebraic.create(opts);
	},
	createSimple : function () {
		'use strict';

		return simple.create();
	}
};
