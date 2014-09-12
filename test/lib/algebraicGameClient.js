var
	piece = requireWithCoverage('piece'),
	algebraicGameClient = requireWithCoverage('algebraicGameClient');

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
	// adding for issue #6
	it('should properly show valid White Pawn promotions', function() {
		var gc = algebraicGameClient.create(),
			r = null;

		gc.game.board.getSquare('a7').piece = null;
		gc.game.board.getSquare('a8').piece = null;
		gc.game.board.getSquare('a2').piece = null;
		gc.game.board.getSquare('a7').piece = piece.createPawn(piece.SideType.White);
		gc.game.board.getSquare('a7').piece.moveCount = 1;

		r = gc.getStatus(true);

		assert.isUndefined(r.notatedMoves['a8'], 'pawn should promote');
		assert.isDefined(r.notatedMoves['a8R'], 'pawn promotion to rook');
		assert.isDefined(r.notatedMoves['a8N'], 'pawn promotion to Knight');
		assert.isDefined(r.notatedMoves['a8B'], 'pawn promotion to Bishop');
		assert.isDefined(r.notatedMoves['a8Q'], 'pawn promotion to Queen');
	});

	it('should properly show valid Black Pawn promotions', function() {
		var gc = algebraicGameClient.create(),
			r = null;

		gc.game.board.getSquare('a2').piece = null;
		gc.game.board.getSquare('a1').piece = null;
		gc.game.board.getSquare('a7').piece = null;
		gc.game.board.getSquare('a2').piece = piece.createPawn(piece.SideType.Black);
		gc.game.board.getSquare('a2').piece.moveCount = 1;

		gc.getStatus(true);
		gc.move('h4');
		r = gc.getStatus(true);

		assert.isUndefined(r.notatedMoves['a1'], 'pawn should promote');
		assert.isDefined(r.notatedMoves['a1R'], 'pawn promotion to rook');
		assert.isDefined(r.notatedMoves['a1N'], 'pawn promotion to Knight');
		assert.isDefined(r.notatedMoves['a1B'], 'pawn promotion to Bishop');
		assert.isDefined(r.notatedMoves['a1Q'], 'pawn promotion to Queen');
	});

	// test pawn promotion
	it('should properly recognize White Pawn promotion to Rook', function() {
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

	// test pawn promotion
	it('should properly recognize Black Pawn promotion to Rook', function() {
		var gc = algebraicGameClient.create(),
			m = null,
			r = null;

		gc.game.board.getSquare('a2').piece = null;
		gc.game.board.getSquare('a1').piece = null;
		gc.game.board.getSquare('b1').piece = null;
		gc.game.board.getSquare('c1').piece = null;
		gc.game.board.getSquare('d1').piece = null;
		gc.game.board.getSquare('a7').piece = null;
		gc.game.board.getSquare('a2').piece = piece.createPawn(piece.SideType.Black);
		gc.game.board.getSquare('a2').piece.moveCount = 1;

		gc.getStatus(true);
		gc.move('h3');
		m = gc.move('a1R');
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

	// Issue #3 - Ensure no phantom pawns appear after sequence of moves
	it ('should not have a random Black Pawn appear on the board (bug fix test)', function () {
		var gc = algebraicGameClient.create(),
			m = null,
			s = gc.game.board.getSquare('a6');

		// turn 1
		gc.move('e4');
		gc.move('e5');

		// turn 2
		gc.move('d3');
		gc.move('Nc6');

		// turn 3
		gc.move('Nf3');
		gc.move('Bb4');

		// turn 4
		gc.move('Nfd2');
		gc.move('d6');

		// turn 5
		gc.move('a3');
		gc.move('Bc5');

		// turn 6
		gc.move('Be2');
		gc.move('Qf6');

		// turn 7
		gc.move('0-0');
		gc.move('Bxf2');

		// turn 8
		gc.move('Rxf2');
		gc.move('Qe6');

		// turn 9
		gc.move('Nc4');
		gc.move('Nd4');

		// turn 10
		gc.move('Bf1');
		gc.move('Bd7');

		// turn 11
		gc.move('c3');
		gc.move('Nb3');

		// turn 12
		gc.move('Ra2');
		gc.move('Ba4');

		// turn 13
		gc.move('Qc2');
		gc.move('Nh6');

		// turn 14
		gc.move('d4');
		gc.move('Ng4');

		// turn 15
		gc.move('Rf3');
		gc.move('b5');

		// turn 16
		gc.move('Nxe5');
		gc.move('Nxc1');

		// turn 17
		gc.move('Qxc1');
		gc.move('dxe5');

		// turn 18
		gc.move('Ra1');
		gc.move('Rb8');

		// turn 19
		gc.move('h3');
		gc.move('Rb6');

		// turn 20
		gc.move('hxg4');
		gc.move('Qxg4');

		// turn 21
		gc.move('Nd2');
		gc.move('a5');

		// turn 22
		gc.move('dxe5');
		gc.move('Rc6');

		// turn 23
		gc.move('c4');
		gc.move('h5');

		// turn 24
		gc.move('Rb1');
		gc.move('Rhh6');

		// turn 25
		gc.move('Ra1');
		gc.move('Rce6');

		// turn 26
		gc.move('Bd3');
		gc.move('Rxe5');

		// turn 27
		gc.move('cxb5');

		assert.ok(s.piece === null, 'Phantom piece appears prior to Rg6');

		m = gc.move('Rg6');

		assert.ok(s.piece === null, 'Phantom piece appears after Rg6');
	});

	// Issue #4 - Ensure proper checkmate detection with Knight
	it ('should properly detect checkmate', function () {
		var gc = algebraicGameClient.create(),
			m = null,
			status = null;

		gc.move('e4');
		gc.move('e5');


		gc.move('Nc3');
		gc.move('d6');


		gc.move('Bc4');
		gc.move('Be6');


		gc.move('Bb3');
		gc.move('Nf6');


		gc.move('Nge2');
		gc.move('Nh5');


		gc.move('Bxe6');
		gc.move('fxe6');


		gc.move('d4');
		gc.move('Be7');


		gc.move('dxe5');
		gc.move('dxe5');


		gc.move('Qxd8');
		gc.move('Bxd8');


		gc.move('Be3');
		gc.move('0-0');


		gc.move('0-0-0');
		gc.move('Nc6');


		gc.move('Rhf1');
		gc.move('Bh4');


		gc.move('Nb5');
		gc.move('Rac8');


		gc.move('f3');
		gc.move('a6');


		gc.move('Nbc3');
		gc.move('Nb4');


		gc.move('Bc5');
		gc.move('Nxa2');


		gc.move('Nxa2');
		gc.move('b6');


		gc.move('Bxf8');
		gc.move('Rxf8');


		gc.move('Nb4');
		gc.move('a5');


		gc.move('Nc6');
		gc.move('Ra8');


		gc.move('Nxe5');
		gc.move('c5');


		gc.move('Rd6');
		gc.move('Rc8');


		gc.move('Rxb6');
		gc.move('c4');


		gc.move('f4');
		gc.move('c3');


		gc.move('Nxc3');
		gc.move('Rxc3');


		gc.move('Rb8');

		status = gc.getStatus();
		assert.strictEqual(status.notatedMoves['Kf7'], undefined);
	});

	// Issue #8 - Ensure no extraneous Black Pawn
	it ('should not have a random Black Pawn appear on the board (bug fix test)', function () {
		var gc = algebraicGameClient.create(),
			m = null,
			s = gc.game.board.getSquare('e6');

		gc.move('d4');
		gc.move('a6');


		gc.move('d5');

		assert.ok(s.piece === null, 'phantom piece appears before e5');

		gc.move('e5');

		assert.ok(s.piece === null, 'phantom piece appears after e5');
	});
});
