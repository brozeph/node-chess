import { AlgebraicGameClient } from './algebraicGameClient.js';
import { SimpleGameClient } from './simpleGameClient.js';
import { UCIGameClient } from './uciGameClient.js';

export const create = (opts) => AlgebraicGameClient.create(opts);
export const createSimple = () => SimpleGameClient.create();
export const fromFEN = (fen, opts) => AlgebraicGameClient.fromFEN(fen, opts);
export const createUCI = () => UCIGameClient.create();

// exports
export default {
	create,
	createSimple,
	createUCI,
	fromFEN
};
