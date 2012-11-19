var assert = require('assert'),
	piece = require('../lib/piece.js'),
	board = require('../lib/board.js'),
	game = require('../lib/game.js');

describe('Game', function() {

	// make sure there is no move history when game is created
	it('should have no move history when game is created', function() {
		var g = game.create();

		assert.strictEqual(g.moveHistory.length, 0);
	});

	// verify move history is tracked on game when a move is made on board
	it('should have move history length of 2 after 2 moves are made', function() {
		var g = game.create(),
			b = g.board;

		b.move(b.getSquare('d', 2), b.getSquare('d', 4));
		b.move(b.getSquare('d', 7), b.getSquare('d', 5));

		assert.strictEqual(g.moveHistory.length, 2);
	});

	// ensure that when simulated moves are made on board, game history is not incremented
	it('should have no move history when only simulated moves are made', function() {
		var g = game.create(),
			b = g.board,
			r = b.move(b.getSquare('e', 2), b.getSquare('e', 4), true);

		assert.strictEqual(g.moveHistory.length, 0);

		r.undo();
	
		assert.strictEqual(g.moveHistory.length, 0);
	});

	// ensure board position hash is accurate across moves
	it('should have accurate hash code after each move stored in move history', function() {
		var g = game.create(),
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

	// ensure board position hash is accurate across games
	it('should have consistent board hash across different game objects with same move histories', function() {
		var g1 = game.create(),
			b1 = g1.board,
			g2 = game.create(),
			b2 = g2.board;

		b1.move(b1.getSquare('d', 2), b1.getSquare('d', 4));
		b1.move(b1.getSquare('d', 7), b1.getSquare('d', 5));
	
		b2.move(b2.getSquare('d', 2), b2.getSquare('d', 4));
		b2.move(b2.getSquare('d', 7), b2.getSquare('d', 5));

		assert.strictEqual(g1.moveHistory[0].hashCode, g2.moveHistory[0].hashCode);
		assert.strictEqual(g1.moveHistory[1].hashCode, g2.moveHistory[1].hashCode);
	});

	// Issue #1 - Ensure no phantom pawns appear after sequence of moves
	it('should not have phantom pawn appear after specific sequence of moves - Issue #1', function() {
		var g = game.create(),
			b = g.board,
			r = null;

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

		r = b.move(b.getSquare('b', 5), b.getSquare('c', 6));

		assert.ok(b.getSquare('c5').piece === null);
	});

	// ensure load from moveHistory results in board in appropriate state
});