var assert = require('assert'),
	piece = require('../lib/piece.js'),
	algebraicGameClient = require('../lib/algebraicGameClient.js');

describe('AlgebraicGameClient', function() {

	// test create and getStatus
	it('should have proper status once board is created', function() {
		var gc = algebraicGameClient.create(),
			s = gc.getStatus();

		assert.strictEqual(s.isCheck, false);
		assert.strictEqual(s.isCheckmate, false);
		assert.strictEqual(s.isRepetition, false);
		assert.strictEqual(s.isStalemate, false);
		assert.strictEqual(Object.keys(s.notatedMoves).length, 20);
	});

	// test pawn move
	it('should have proper board status after moving a piece', function() {
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
	});

	// test pawn capture enemy
	it('should recognize piece capture', function() {
		var gc = algebraicGameClient.create(),
			r = null;

		gc.move('e4');
		gc.move('d5');
		r = gc.move('exd5');

		assert.strictEqual(r.move.capturedPiece.type, piece.PieceType.Pawn);
	});

	// test 2 face pieces with same square destination on different rank and file
	it('should properly notate two Knights that can occupy same square for their respective moves', function() {
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
	});

	// test 2 face pieces with same square destination on different ranks
	it('should properly notate two Rooks that can occupy same square from different ranks', function() {
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
	});

	// test 2 face pieces with same square destination on different files
	it('should properly notate two Rooks that can occupy same square from different files', function() {
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
	});

	// test castle left
	it('should properly notate white King castle left', function() {
		var gc = algebraicGameClient.create(),
			s = null;

		gc.game.board.getSquare('b1').piece = null;
		gc.game.board.getSquare('c1').piece = null;
		gc.game.board.getSquare('d1').piece = null;

		s = gc.getStatus(true);

		assert.ok(typeof s.notatedMoves['0-0-0'] !== 'undefined', '0-0-0');
	});

	// test castle right
	it('should properly notate black King castle right', function() {
		var gc = algebraicGameClient.create(),
			s = null;

		gc.game.board.getSquare('f8').piece = null;
		gc.game.board.getSquare('g8').piece = null;
		gc.getStatus(true);
		gc.move('a4');
		s = gc.getStatus();

		assert.ok(typeof s.notatedMoves['0-0'] !== 'undefined', '0-0');
	});

	// validate parse notation with O-O-O
	it('should properly recognize white King castle left notation', function() {
		var gc = algebraicGameClient.create(),
			m = null;

		gc.game.board.getSquare('b1').piece = null;
		gc.game.board.getSquare('c1').piece = null;
		gc.game.board.getSquare('d1').piece = null;
		gc.getStatus(true);
		m = gc.move('O-O-O');

		assert.ok(m !== null, 'parse O-O-O');
		assert.ok(m.move.castle);
	});

	// validate parse notation with O-O
	it('should properly recognize black King castle right notation', function() {
		var gc = algebraicGameClient.create(),
			m = null;

		gc.game.board.getSquare('f8').piece = null;
		gc.game.board.getSquare('g8').piece = null;
		gc.getStatus(true);
		gc.move('a4');
		m = gc.move('O-O');

		assert.ok(m !== null, 'parse O-O');
		assert.ok(m.move.castle);
	});

	// test pawn promotion
	it('should properly recognize Pawn promotion to Rook', function() {
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
	});

	// test ambiguous notation
	it('should throw exception when notation is too ambiguous to determine which piece to move', function() {
		var gc = algebraicGameClient.create();

		gc.move('a4');
		gc.move('a5');
		gc.move('h4');
		gc.move('h5');
		gc.move('Ra3');
		gc.move('Ra6');

		assert.throws(function() { gc.move('Rh3'); }); // could be Rhh3 or Rah3
	});

	// test invalid notation
	it('should throw an exception when the notation provided is fail', function() {
		var gc = algebraicGameClient.create();

		assert.throws(function() { gc.move('h6'); });
		assert.throws(function() { gc.move('z9'); });
	});

	// test overly specified notation
	it('should properly parse overly verbose notation', function() {
		var gc = algebraicGameClient.create(),
			m = null;

		m = gc.move('Nb1c3');

		assert.ok(m !== null);
		assert.strictEqual(m.move.postSquare.file, 'c');
		assert.strictEqual(m.move.postSquare.rank, 3);
		assert.strictEqual(m.move.postSquare.piece.type, piece.PieceType.Knight);
	});

	// Issue #1 - Ensure no phantom pawns appear after sequence of moves in AlgebraicGameClient
	it('should not have a random Pawn appear on the board after a specific sequence of moves (bug fix test)', function() {
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
	});

});