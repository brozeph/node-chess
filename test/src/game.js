/* eslint no-magic-numbers:0 */
import { assert, describe, it } from 'vitest';
import { PieceType, SideType } from '../../src/piece.js';
import { Game } from '../../src/game.js';

describe('Game', () => {
	// make sure there is no move history when game is created
	it('should have no move history when game is created', () => {
		let g = Game.create();

		assert.strictEqual(g.moveHistory.length, 0);
	});

	// verify move history is tracked on game when a move is made on board
	it('should have move history length of 2 after 2 moves are made', () => {
		let
			b,
			g = Game.create();

		b = g.board;

		b.move(b.getSquare('d', 2), b.getSquare('d', 4));
		b.move(b.getSquare('d', 7), b.getSquare('d', 5));

		assert.strictEqual(g.moveHistory.length, 2);
	});

	// verify move history is updated on game when an undo occurs on board
	it('should have move history length of 1 after 2 moves and undo', () => {
		let
			b,
			g = Game.create(),
			m;

		b = g.board;

		b.move(b.getSquare('d', 2), b.getSquare('d', 4));
		m = b.move(b.getSquare('d', 7), b.getSquare('d', 5));
		m.undo();

		assert.strictEqual(g.moveHistory.length, 1);
	});

	// ensure that when simulated moves are made on board, game history is not incremented
	it('should have no move history when only simulated moves are made', () => {
		let
			b,
			g = Game.create(),
			r;

		b = g.board;
		r = b.move(b.getSquare('e', 2), b.getSquare('e', 4), true);

		assert.strictEqual(g.moveHistory.length, 0);

		r.undo();

		assert.strictEqual(g.moveHistory.length, 0);
	});

	// ensure board position hash is accurate across moves
	it('should have accurate hash code after each move stored in move history', () => {
		let
			b,
			g = Game.create();

		b = g.board;

		b.move(b.getSquare('d', 2), b.getSquare('d', 4));
		b.move(b.getSquare('d', 7), b.getSquare('d', 5));

		b.move(b.getSquare('c', 1), b.getSquare('f', 4));
		b.move(b.getSquare('c', 8), b.getSquare('f', 5));
		b.move(b.getSquare('f', 4), b.getSquare('c', 1));
		b.move(b.getSquare('f', 5), b.getSquare('c', 8));

		b.move(b.getSquare('c', 1), b.getSquare('f', 4));
		b.move(b.getSquare('c', 8), b.getSquare('f', 5));
		b.move(b.getSquare('f', 4), b.getSquare('c', 1));
		b.move(b.getSquare('f', 5), b.getSquare('c', 8));

		assert.strictEqual(g.moveHistory.length, 10);
		assert.ok(g.moveHistory[0].hashCode !== g.moveHistory[1].hashCode);
		assert.strictEqual(g.moveHistory[1].hashCode, g.moveHistory[5].hashCode);
		assert.strictEqual(g.moveHistory[3].hashCode, g.moveHistory[7].hashCode);
		assert.strictEqual(g.moveHistory[5].hashCode, g.moveHistory[9].hashCode);
	});

	it('should properly have notation in move history after move when supplied', () => {
		let
			b,
			g = Game.create();

		b = g.board;

		b.move('d2', 'd4', 'd4');
		assert.strictEqual(g.moveHistory.length, 1);
		assert.ok(g.moveHistory[0].algebraic === 'd4');
	});

	it('should not have notation in move history after move when omitted', () => {
		let
			b,
			g = Game.create();

		b = g.board;

		b.move('d2', 'd4');
		assert.strictEqual(g.moveHistory.length, 1);
		assert.ok(typeof g.moveHistory[0].algebraic === 'undefined');
	});

	// ensure board position hash is accurate across games
	it('should have consistent board hash across different game objects with same move histories', () => {
		let
			b1,
			b2,
			g1 = Game.create(),
			g2 = Game.create();

		b1 = g1.board;
		b2 = g2.board;

		b1.move(b1.getSquare('d', 2), b1.getSquare('d', 4));
		b1.move(b1.getSquare('d', 7), b1.getSquare('d', 5));

		b2.move(b2.getSquare('d', 2), b2.getSquare('d', 4));
		b2.move(b2.getSquare('d', 7), b2.getSquare('d', 5));

		assert.strictEqual(g1.moveHistory[0].hashCode, g2.moveHistory[0].hashCode);
		assert.strictEqual(g1.moveHistory[1].hashCode, g2.moveHistory[1].hashCode);
	});

	// Issue #1 - Ensure no phantom pawns appear after sequence of moves
	it('should not have phantom pawn appear after specific sequence of moves - Issue #1', () => {
		let
			b,
			g = Game.create();

		b = g.board;

		b.move(b.getSquare('e', 2), b.getSquare('e', 4));
		b.move(b.getSquare('e', 7), b.getSquare('e', 5));

		b.move(b.getSquare('g', 1), b.getSquare('f', 3));
		b.move(b.getSquare('b', 8), b.getSquare('c', 6));

		b.move(b.getSquare('f', 1), b.getSquare('b', 5));
		b.move(b.getSquare('g', 8), b.getSquare('f', 6));

		b.move(b.getSquare('e', 1), b.getSquare('g', 1));
		b.move(b.getSquare('f', 6), b.getSquare('e', 4));

		b.move(b.getSquare('d', 2), b.getSquare('d', 4));
		b.move(b.getSquare('e', 4), b.getSquare('d', 6));

		b.move(b.getSquare('b', 5), b.getSquare('c', 6));

		assert.ok(b.getSquare('c5').piece === null);
	});

	// ensure load from moveHistory results in board in appropriate state
});

describe('Game capture history', () => {
	it('should track captures and undo correctly', () => {
		const g = Game.create();
		const b = g.board;

		// e2e4, d7d5, e4xd5
		b.move(b.getSquare('e', 2), b.getSquare('e', 4));
		b.move(b.getSquare('d', 7), b.getSquare('d', 5));
		const cap = b.move(b.getSquare('e', 4), b.getSquare('d', 5));

		// verify capture tracked
		if (g.captureHistory.length !== 1) {
			throw new Error('captureHistory should contain one capture');
		}

		const c = g.captureHistory[0];
		
		if (!c || c.type !== PieceType.Pawn || c.side !== SideType.Black) {
			throw new Error('captureHistory should contain captured black pawn');
		}

		// undo and verify capture removed
		cap.undo();
		if (g.captureHistory.length !== 0) {
			throw new Error('captureHistory should be empty after undo');
		}
	});

	it('should track multiple captures in order', () => {
		const g = Game.create();
		const b = g.board;

		// e2e4, d7d5, e4xd5 (capture 1)
		b.move(b.getSquare('e', 2), b.getSquare('e', 4));
		b.move(b.getSquare('d', 7), b.getSquare('d', 5));
		b.move(b.getSquare('e', 4), b.getSquare('d', 5));

		// c7c5, d5xc5 (capture 2)
		b.move(b.getSquare('c', 7), b.getSquare('c', 5));
		const cap2 = b.move(b.getSquare('d', 5), b.getSquare('c', 5));

		if (g.captureHistory.length !== 2) {
			throw new Error('captureHistory should contain two captures');
		}

		const [c1, c2] = g.captureHistory;
		
		if (!c1 || c1.type !== PieceType.Pawn || c1.side !== SideType.Black) {
			throw new Error('first capture should be black pawn from d5');
		}
		
		if (!c2 || c2.type !== PieceType.Pawn || c2.side !== SideType.Black) {
			throw new Error('second capture should be black pawn from c5');
		}

		// undo last capture reduces capture history by 1
		cap2.undo();
		if (g.captureHistory.length !== 1) {
			throw new Error('captureHistory should have one capture after undoing the last capture');
		}
	});
});
