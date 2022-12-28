export * from './algebraicGameClient';
export * from './board';
export * from './boardValidation';
export * from './game';
export * from './gameValidation';
export * from './main';
export * from './piece';
export * from './pieceValidation';
export * from './simpleGameClient';
export * from './square';

import {
    create,
    createSimple
} from './main'

export default {
    create,
    createSimple
}