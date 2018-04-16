import { SimpleGameClient } from './simpleGameClient';

var algebraic = require('./algebraicGameClient.js');

// exports
module.exports = {
	create : (opts) => algebraic.create(opts),
	createSimple : () => SimpleGameClient.create()
};
