var assert = require('assert'),
	piece = require('../lib/piece.js'),
	simpleGameClient = require('../lib/simpleGameClient.js');

// test create and getStatus
module.exports.testSimpleGameClient_Create = function() {
	var gc = simpleGameClient.create(),
		s = gc.getStatus();

	assert.strictEqual(s.isCheck, false);
	assert.strictEqual(s.isCheckmate, false);
	assert.strictEqual(s.isRepetition, false);
	assert.strictEqual(s.isStalemate, false);
	assert.strictEqual(Object.keys(s.validMoves).length, 10);
};

// test pawn move
module.exports.testSimpleGameClient_Pawn_Move = function() {
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
};

// test invalid notation
module.exports.testSimpleGameClient_Move_Fail = function() {
	var gc = simpleGameClient.create();

	assert.throws(function() { gc.move('h6'); });
	assert.throws(function() { gc.move('e2', 'z9'); });
	assert.throws(function() { gc.move('e2', 'e5'); });
};