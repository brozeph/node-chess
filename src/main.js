import { AlgebraicGameClient } from './algebraicGameClient.js';
import { SimpleGameClient } from './simpleGameClient.js';

// exports
module.exports = {
	create : (opts) => AlgebraicGameClient.create(opts),
	createSimple : () => SimpleGameClient.create()
};
