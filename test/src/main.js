/* eslint no-magic-numbers:0 */
import { assert, describe, it } from 'vitest';
import chess, { create, createSimple, createUCI } from '../../src/main.js';
import { AlgebraicGameClient } from '../../src/algebraicGameClient.js';
import { SimpleGameClient } from '../../src/simpleGameClient.js';

describe('main entry', () => {
  it('create() should return an AlgebraicGameClient', () => {
    const gc = create();
    assert.ok(gc instanceof AlgebraicGameClient, 'should be AlgebraicGameClient');
    const s = gc.getStatus();
    assert.strictEqual(typeof s.isCheck, 'boolean');
    assert.ok(typeof gc.move === 'function');
  });

  it('createSimple() should return a SimpleGameClient', () => {
    const sgc = createSimple();
    assert.ok(sgc instanceof SimpleGameClient, 'should be SimpleGameClient');
    const s = sgc.getStatus();
    assert.strictEqual(typeof s.isStalemate, 'boolean');
    assert.ok(typeof sgc.move === 'function');
  });

  it('default export should expose create and createSimple', () => {
    assert.strictEqual(typeof chess.create, 'function');
    assert.strictEqual(typeof chess.createSimple, 'function');
    assert.ok(chess.create() instanceof AlgebraicGameClient);
    assert.ok(chess.createSimple() instanceof SimpleGameClient);
  });

  it('named and default export should expose createUCI', () => {
    assert.strictEqual(typeof createUCI, 'function');
    assert.strictEqual(typeof chess.createUCI, 'function');
  });
});
