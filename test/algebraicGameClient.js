var assert = require('assert'),
	piece = require('../lib/piece.js'),
	algebraicGameClient = require('../lib/algebraicGameClient.js');

// test create and getStatus
module.exports.testAlgebraicGameClient_Create = function() {
	var gc = algebraicGameClient.create(),
		s = gc.getStatus();

	assert.strictEqual(s.isCheck, false);
	assert.strictEqual(s.isCheckmate, false);
	assert.strictEqual(s.isRepetition, false);
	assert.strictEqual(s.isStalemate, false);
	assert.strictEqual(Object.keys(s.notatedMoves).length, 20);
};

// test pawn move
module.exports.testAlgebraicGameClient_Pawn_Move = function() {
	var gc = algebraicGameClient.create(),
		s = null;

	gc.move('b4');
	gc.move('e6');

	s = gc.getStatus();

	assert.strictEqual(s.isCheck, false);
	assert.strictEqual(s.isCheckmate, false);
	assert.strictEqual(s.isRepetition, false);
	assert.strictEqual(s.isStalemate, false);
	assert.strictEqual(Object.keys(s.notatedMoves).length, 21);
};

// test pawn capture enemy
module.exports.testAlgebraicGameClient_Pawn_Capture = function() {
	var gc = algebraicGameClient.create(),
		r = null;

	gc.move('e4');
	gc.move('d5');
	r = gc.move('exd5');

	assert.strictEqual(r.move.capturedPiece.type, piece.PieceType.Pawn);
};

// test 2 face pieces with same square destination on different rank and file
module.exports.testAlgebraicGameClient_Knight_DifferentFile_DifferentRank = function() {
	var gc = algebraicGameClient.create(),
		s = null;

	gc.move('Nc3');
	gc.move('Nf6'); // black N
	gc.move('Nd5');
	gc.move('Ng8'); // black N
	gc.move('Nf4');
	gc.move('Nf6'); // black N

	s = gc.getStatus();

	assert.ok(typeof s.notatedMoves.Nfh3 !== 'undefined', 'Nfh3');
	assert.ok(typeof s.notatedMoves.Ngh3 !== 'undefined', 'Ngh3');
};

// test 2 face pieces with same square destination on different ranks
module.exports.testAlgebraicGameClient_Rook_SameFile_DifferentRank = function() {
	var gc = algebraicGameClient.create(),
		s = null;

	gc.move('a4');
	gc.move('a5');
	gc.move('h4');
	gc.move('h5');
	gc.move('Ra3');
	gc.move('Ra6');
	gc.move('Rhh3');
	gc.move('Rhh6');

	s = gc.getStatus();

	assert.ok(typeof s.notatedMoves.Rae3 !== 'undefined', 'Rae3');
	assert.ok(typeof s.notatedMoves.Rhe3 !== 'undefined', 'Rhe3');
};

// test 2 face pieces with same square destination on different files
module.exports.testAlgebraicGameClient_Rook_DifferentFile_SameRank = function() {
	var gc = algebraicGameClient.create(),
		s = null;

	gc.move('a4');
	gc.move('a5');
	gc.move('h4');
	gc.move('h5');
	gc.move('Ra3');
	gc.move('Ra6');
	gc.move('Rhh3');
	gc.move('Rhh6');
	gc.move('Rae3');
	gc.move('Rh8');
	gc.move('Re6');
	gc.move('Ra8');
	gc.move('Rhe3');
	gc.move('Ra6');

	s = gc.getStatus();

	assert.ok(typeof s.notatedMoves.R6e5 !== 'undefined', 'R6e5');
	assert.ok(typeof s.notatedMoves.R3e5 !== 'undefined', 'R3e5');
};

// test castle left
module.exports.testAlgebraicGameClient_WhiteKing_CastleLeft = function() {
	var gc = algebraicGameClient.create(),
		s = null;

	gc.game.board.getSquare('b1').piece = null;
	gc.game.board.getSquare('c1').piece = null;
	gc.game.board.getSquare('d1').piece = null;

	s = gc.getStatus(true);

	assert.ok(typeof s.notatedMoves['0-0-0'] !== 'undefined', '0-0-0');
};

// test castle right
module.exports.testAlgebraicGameClient_BlackKing_CastleRight = function() {
	var gc = algebraicGameClient.create(),
		s = null;

	gc.game.board.getSquare('f8').piece = null;
	gc.game.board.getSquare('g8').piece = null;
	gc.getStatus(true);
	gc.move('a4');
	s = gc.getStatus();

	assert.ok(typeof s.notatedMoves['0-0'] !== 'undefined', '0-0');
};

// validate parse notation with O-O-O
module.exports.testAlgebraicGameClient_WhiteKing_Parse_CastleLeft = function() {
	var gc = algebraicGameClient.create(),
		m = null;

	gc.game.board.getSquare('b1').piece = null;
	gc.game.board.getSquare('c1').piece = null;
	gc.game.board.getSquare('d1').piece = null;
	gc.getStatus(true);
	m = gc.move('O-O-O');

	assert.ok(m !== null, 'parse O-O-O');
	assert.ok(m.move.castle);
};

// validate parse notation with O-O
module.exports.testAlgebraicGameClient_BlackKing_Parse_CastleRight = function() {
	var gc = algebraicGameClient.create(),
		m = null;

	gc.game.board.getSquare('f8').piece = null;
	gc.game.board.getSquare('g8').piece = null;
	gc.getStatus(true);
	gc.move('a4');
	m = gc.move('O-O');

	assert.ok(m !== null, 'parse O-O');
	assert.ok(m.move.castle);
};

// test pawn promotion
module.exports.testAlgebraicGameClient_WhitePawn_Promotion = function() {
	var gc = algebraicGameClient.create(),
		m = null,
		r = null;

	gc.game.board.getSquare('a7').piece = null;
	gc.game.board.getSquare('a8').piece = null;
	gc.game.board.getSquare('b8').piece = null;
	gc.game.board.getSquare('c8').piece = null;
	gc.game.board.getSquare('d8').piece = null;
	gc.game.board.getSquare('a2').piece = null;
	gc.game.board.getSquare('a7').piece = piece.createPawn(piece.SideType.White);
	gc.game.board.getSquare('a7').piece.moveCount = 1;

	gc.getStatus(true);
	m = gc.move('a8R');

	r = gc.getStatus();

	assert.strictEqual(m.move.postSquare.piece.type, piece.PieceType.Rook);
	assert.strictEqual(r.isCheckmate, true);
};

// test ambiguous notation
module.exports.testAlgebraicGameClient_Move_AmbiguousNotation = function() {
	var gc = algebraicGameClient.create();

	gc.move('a4');
	gc.move('a5');
	gc.move('h4');
	gc.move('h5');
	gc.move('Ra3');
	gc.move('Ra6');

	assert.throws(function() { gc.move('Rh3'); }); // could be Rhh3 or Rah3
};

// test invalid notation
module.exports.testAlgebraicGameClient_Move_FailNotation = function() {
	var gc = algebraicGameClient.create();

	assert.throws(function() { gc.move('h6'); });
	assert.throws(function() { gc.move('z9'); });
};

// test overly specified notation
module.exports.testAlgebraicGameClient_Move_OverNotation = function() {
	var gc = algebraicGameClient.create(),
		m = null;

	m = gc.move('Nb1c3');

	assert.ok(m !== null);
	assert.strictEqual(m.move.postSquare.file, 'c');
	assert.strictEqual(m.move.postSquare.rank, 3);
	assert.strictEqual(m.move.postSquare.piece.type, piece.PieceType.Knight);
};

// Issue #1 - Ensure no phantom pawns appear after sequence of moves in AlgebraicGameClient
module.exports.testAlgebraicGameClient_DefectFix_SpontaneousPawn = function() {
	var gc = algebraicGameClient.create(),
		m = null,
		s = gc.game.board.getSquare('c5');

	// turn 1
	gc.move('e4');
	gc.move('e5');

	// turn 2
	gc.move('Nf3');
	gc.move('Nc6');

	// turn 3
	gc.move('Bb5');
	gc.move('Nf6');

	// turn 4
	gc.move('O-O');
	gc.move('Nxe4');

	// turn 5
	gc.move('d4');
	gc.move('Nd6');

	assert.ok(s.piece === null, 'Phantom piece appears prior to Bxc6');

	// turn 6
	m = gc.move('Bxc6');

	assert.ok(s.piece === null, 'Phantom piece appears after Bxc6');
};