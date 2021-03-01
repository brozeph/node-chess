/* eslint no-magic-numbers:0 */

import { Game } from '../../src/game';

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
