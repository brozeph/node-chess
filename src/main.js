import { AlgebraicGameClient } from './algebraicGameClient';
import { SimpleGameClient } from './simpleGameClient';

// exports
module.exports = {
	create : (opts) => AlgebraicGameClient.create(opts),
	createSimple : () => SimpleGameClient.create()
};
