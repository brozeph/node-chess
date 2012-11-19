var assert = require('assert'),
	piece = require('../lib/piece.js'),
	simpleGameClient = require('../lib/simpleGameClient.js');

describe('SimpleGameClient', function() {

	// test create and getStatus
	it('should properly create simple game client', function() {
		var gc = simpleGameClient.create(),
			s = gc.getStatus();

		assert.strictEqual(s.isCheck, false);
		assert.strictEqual(s.isCheckmate, false);
		assert.strictEqual(s.isRepetition, false);
		assert.strictEqual(s.isStalemate, false);
		assert.strictEqual(Object.keys(s.validMoves).length, 10);
	});

	// test pawn move
	it('should properly represent status after first pawn moves', function() {
		var gc = simpleGameClient.create(),
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
	it('should properly throw exception for invalid moves', function() {
		var gc = simpleGameClient.create();

		assert.throws(function() { gc.move('h6'); });
		assert.throws(function() { gc.move('e2', 'z9'); });
		assert.throws(function() { gc.move('e2', 'e5'); });
	});

	// Issue #1 - Ensure no phantom pawns appear after sequence of moves in SimpleGameClient
	it('should not have a random Pawn appear on the board after a specific sequence of moves (bug fix test)', function() {
		var gc = simpleGameClient.create(),
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
});