/* eslint no-magic-numbers:0 */
import { assert, describe, it } from 'vitest';
import { PieceType, SideType, Piece } from '../../src/piece.js';
import { UCIGameClient } from '../../src/uciGameClient.js';

describe('UCIGameClient', () => {
  it('should have proper status once board is created', () => {
    const gc = UCIGameClient.create();
    const s = gc.getStatus();

    assert.strictEqual(s.isCheck, false);
    assert.strictEqual(s.isCheckmate, false);
    assert.strictEqual(s.isRepetition, false);
    assert.strictEqual(s.isStalemate, false);
    assert.strictEqual(Object.keys(s.uciMoves).length, 20);
  });

  it('should trigger move events on UCI moves', () => {
    const gc = UCIGameClient.create();
    const moveEvent = [];
    gc.on('move', (ev) => moveEvent.push(ev));

    gc.move('b2b4');
    gc.move('e7e6');

    assert.ok(moveEvent);
    assert.strictEqual(moveEvent.length, 2);
  });

  it('should perform a pawn capture using UCI', () => {
    const gc = UCIGameClient.create();

    gc.move('e2e4');
    gc.move('d7d5');
    const r = gc.move('e4d5');

    assert.strictEqual(r.move.capturedPiece.type, PieceType.Pawn);
  });

  it('should castle using UCI coordinates', () => {
    const gc = UCIGameClient.create();
    const castleEvent = [];
    gc.on('castle', (ev) => castleEvent.push(ev));

    // clear path for white long castle (e1c1)
    gc.game.board.getSquare('b1').piece = null;
    gc.game.board.getSquare('c1').piece = null;
    gc.game.board.getSquare('d1').piece = null;

    gc.getStatus(true);
    gc.move('e1c1');
    
    assert.ok(castleEvent);
    assert.strictEqual(castleEvent.length, 1);
  });

  it('should handle pawn promotion via UCI and enumerate all promotion options', () => {
    const gc = UCIGameClient.create();

    // setup white pawn a7->a8=Q checkmate scenario
    gc.game.board.getSquare('a7').piece = null;
    gc.game.board.getSquare('a8').piece = null;
    gc.game.board.getSquare('b8').piece = null;
    gc.game.board.getSquare('c8').piece = null;
    gc.game.board.getSquare('d8').piece = null;
    gc.game.board.getSquare('a2').piece = null;
    gc.game.board.getSquare('a7').piece = Piece.createPawn(SideType.White);
    gc.game.board.getSquare('a7').piece.moveCount = 1;

    const pre = gc.getStatus(true);
    assert.isUndefined(pre.uciMoves['a7a8']);
    assert.isDefined(pre.uciMoves['a7a8q']);
    assert.isDefined(pre.uciMoves['a7a8r']);
    assert.isDefined(pre.uciMoves['a7a8b']);
    assert.isDefined(pre.uciMoves['a7a8n']);
    const m = gc.move('a7a8q');
    const r = gc.getStatus();

    assert.strictEqual(m.move.postSquare.piece.type, PieceType.Queen);
    assert.strictEqual(r.isCheckmate, true);
  });

  it('should throw on invalid UCI', () => {
    const gc = UCIGameClient.create();
    assert.throws(() => gc.move('e9e4'));
    assert.throws(() => gc.move('abcd'));
  });
});
