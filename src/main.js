import { AlgebraicGameClient } from './algebraicGameClient.js';
import { SimpleGameClient } from './simpleGameClient.js';

// exports
export default {
	create : (opts) => AlgebraicGameClient.create(opts),
	createSimple : () => SimpleGameClient.create()
};
