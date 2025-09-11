import { AlgebraicGameClient } from './algebraicGameClient.js';
import { SimpleGameClient } from './simpleGameClient.js';

export const create = (opts) => AlgebraicGameClient.create(opts);
export const createSimple = () => SimpleGameClient.create();
export const fromFEN = (fen, opts) => AlgebraicGameClient.fromFEN(fen, opts);

// exports
export default {
	create,
	createSimple,
	fromFEN
};