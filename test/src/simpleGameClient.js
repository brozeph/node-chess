/* eslint no-magic-numbers:0 */
import { assert, describe, it } from 'vitest';
import { Piece, PieceType, SideType } from '../../src/piece.js';
import { SimpleGameClient } from '../../src/simpleGameClient.js';

describe('SimpleGameClient', () => {
	// test create and getStatus
	it('should properly create simple game client', () => {
		let
			gc = SimpleGameClient.create(),
			s = gc.getStatus();

		assert.strictEqual(s.isCheck, false);
		assert.strictEqual(s.isCheckmate, false);
		assert.strictEqual(s.isRepetition, false);
		assert.strictEqual(s.isStalemate, false);
		assert.strictEqual(Object.keys(s.validMoves).length, 10);
	});

	// test pawn move
	it('should properly represent status after first pawn moves', () => {
		let
			gc = SimpleGameClient.create(),
			s = null;

		gc.move('b2', 'b4');
		gc.move('e7', 'e6');

		s = gc.getStatus();

		assert.strictEqual(s.isCheck, false);
		assert.strictEqual(s.isCheckmate, false);
		assert.strictEqual(s.isRepetition, false);
		assert.strictEqual(s.isStalemate, false);
		assert.strictEqual(Object.keys(s.validMoves).length, 11);
	});

	// test invalid notation
	it('should properly throw exception for invalid moves', () => {
		let gc = SimpleGameClient.create();

		assert.throws(() => {
			gc.move('h6');
		});
		assert.throws(() => {
			gc.move('e2', 'z9');
		});
		assert.throws(() => {
			gc.move('e2', 'e5');
		});
	});

	// Issue #1 - Ensure no phantom pawns appear after sequence of moves in SimpleGameClient
	it('should not have a random Pawn appear on the board after a specific sequence of moves (bug fix test)', () => {
		let
			b,
			gc = SimpleGameClient.create();

		b = gc.game.board;

		gc.move('e2', 'e4');
		gc.move('e7', 'e5');

		gc.move('g1', 'f3');
		gc.move('b8', 'c6');

		gc.move('f1', 'b5');
		gc.move('g8', 'f6');

		gc.move('e1', 'g1');
		gc.move('f6', 'e4');

		gc.move('d2', 'd4');
		gc.move('e4', 'd6');

		gc.move('b5', 'c6');

		assert.ok(b.getSquare('c5').piece === null, 'Phantom piece appears after move from c5 to c6');
	});

	// Issue #23 - Show who is attacking the King
	it ('should properly emit check and indicate attackers of the King', () => {
		let
			checkResult = null,
			gc = SimpleGameClient.create();

		gc.on('check', (result) => (checkResult = result));

		// position the board for a promotion next move
		gc.game.board.getSquare('b1').piece = null;
		gc.game.board.getSquare('f6').piece = Piece.createKnight(SideType.White);
		gc.game.board.getSquare('f6').piece.moveCount = 1;

		// move to trigger evaluation that King is check
		gc.move('a2', 'a3');

		// force recalculation of board position
		gc.getStatus(true);

		// make sure Pawn promotions are present
		assert.isDefined(checkResult);
		assert.strictEqual(checkResult.attackingSquare.piece.type, PieceType.Knight);
	});

	// getCaptureHistory: track captures and undo
	it('should expose capture history via getCaptureHistory()', () => {
		const gc = SimpleGameClient.create();
		gc.move('e2', 'e4');
		gc.move('d7', 'd5');
		const cap = gc.move('e4', 'd5');

		const h1 = gc.getCaptureHistory();
		assert.strictEqual(h1.length, 1);
		assert.strictEqual(h1[0].type, PieceType.Pawn);

		cap.undo();
		const h2 = gc.getCaptureHistory();
		assert.strictEqual(h2.length, 0);
	});

	it('should emit castle event when castling by coordinates', () => {
		const gc = SimpleGameClient.create();
		const castleEvents = [];
		gc.on('castle', (ev) => castleEvents.push(ev));

		// clear path for white castle short (e1 -> g1)
		gc.game.board.getSquare('f1').piece = null;
		gc.game.board.getSquare('g1').piece = null;

		// force update to compute valid moves with cleared path
		gc.getStatus(true);
		gc.move('e1', 'g1');

		assert.strictEqual(castleEvents.length, 1);
	});

	it('should handle en passant and emit event', () => {
		const gc = SimpleGameClient.create();
		const enPassantEvents = [];
		gc.on('enPassant', (ev) => enPassantEvents.push(ev));

		// Setup: e2e4, a7a6, e4e5, d7d5, e5d6 e.p.
		gc.move('e2', 'e4');
		gc.move('a7', 'a6');
		gc.move('e4', 'e5');
		gc.move('d7', 'd5');

		const m = gc.move('e5', 'd6');
		assert.ok(m.move.enPassant);
		assert.strictEqual(enPassantEvents.length, 1);
	});

	it('should handle pawn promotion and emit event', () => {
		const gc = SimpleGameClient.create();
		const promoteEvents = [];
		gc.on('promote', (ev) => promoteEvents.push(ev));

		// Setup white pawn on a7 ready to promote, clear a8 and block pieces
		gc.game.board.getSquare('a7').piece = null;
		gc.game.board.getSquare('a8').piece = null;
		gc.game.board.getSquare('b8').piece = null;
		gc.game.board.getSquare('c8').piece = null;
		gc.game.board.getSquare('d8').piece = null;
		gc.game.board.getSquare('a2').piece = null;
		gc.game.board.getSquare('a7').piece = Piece.createPawn(SideType.White);
		gc.game.board.getSquare('a7').piece.moveCount = 1;

		gc.getStatus(true);
		const m = gc.move('a7', 'a8', 'Q');

		assert.strictEqual(m.move.postSquare.piece.type, PieceType.Queen);
		assert.strictEqual(promoteEvents.length, 1);
		assert.strictEqual(gc.game.moveHistory[0].promotion, true);
	});
});
