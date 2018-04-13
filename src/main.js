import { SimpleGameClient } from './simpleGameClient';

var algebraic = require('./algebraicGameClient.js');

// exports
module.exports = {
	create : function (opts) {
		'use strict';

		return algebraic.create(opts);
	},
	createSimple : function () {
		'use strict';

		return SimpleGameClient.create();
	}
};
