/* eslint no-magic-numbers:0 */
import { Piece, PieceType, SideType } from '../../src/piece.js';
import { AlgebraicGameClient } from '../../src/algebraicGameClient.js';

import { assert } from 'chai';

describe('AlgebraicGameClient', () => {
	// test create and getStatus
	it('should have proper status once board is created', () => {
		let
			gc = AlgebraicGameClient.create(),
			s = gc.getStatus();

		assert.strictEqual(s.isCheck, false);
		assert.strictEqual(s.isCheckmate, false);
		assert.strictEqual(s.isRepetition, false);
		assert.strictEqual(s.isStalemate, false);
		assert.strictEqual(Object.keys(s.notatedMoves).length, 20);
	});

	// test move event
	it('should trigger event when moving a piece', () => {
		let
			gc = AlgebraicGameClient.create(),
			moveEvent = [];

		gc.on('move', (ev) => moveEvent.push(ev));

		gc.move('b4');
		gc.move('e6');

		assert.ok(moveEvent);
		assert.strictEqual(moveEvent.length, 2);
	});

	// test pawn move
	it('should have proper board status after moving a piece', () => {
		let
			gc = AlgebraicGameClient.create(),
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
	it('should recognize piece capture', () => {
		let
			gc = AlgebraicGameClient.create(),
			r = null;

		gc.move('e4');
		gc.move('d5');
		r = gc.move('exd5');

		assert.strictEqual(r.move.capturedPiece.type, PieceType.Pawn);
	});

	// test capture event
	it('should properly emit a capture event', () => {
		let
			captureEvent = [],
			gc = AlgebraicGameClient.create();

		gc.on('capture', (ev) => captureEvent.push(ev));

		gc.move('e4');
		gc.move('d5');
		gc.move('exd5');

		assert.ok(captureEvent);
		assert.strictEqual(captureEvent.length, 1);
	});

	// test notation in history
	it('should properly record notation in history', () => {
		let gc = AlgebraicGameClient.create();

		gc.move('e4');
		gc.move('d5');
		gc.move('exd5');

		assert.strictEqual(gc.game.moveHistory[2].algebraic, 'exd5');
	});

	// test 2 face pieces with same square destination on different rank and file
	it('should properly notate two Knights that can occupy same square for their respective moves', () => {
		let
			gc = AlgebraicGameClient.create(),
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
	it('should properly notate two Rooks that can occupy same square from different ranks', () => {
		let
			gc = AlgebraicGameClient.create(),
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
	it('should properly notate two Rooks that can occupy same square from different files', () => {
		let
			gc = AlgebraicGameClient.create(),
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
	it('should properly notate white King castle left and trigger event', () => {
		let
			castleEvent = [],
			gc = AlgebraicGameClient.create(),
			s = null;

		gc.on('castle', (ev) => castleEvent.push(ev));

		gc.game.board.getSquare('b1').piece = null;
		gc.game.board.getSquare('c1').piece = null;
		gc.game.board.getSquare('d1').piece = null;

		s = gc.getStatus(true);

		assert.ok(typeof s.notatedMoves['0-0-0'] !== 'undefined', '0-0-0');

		// perform castle move
		gc.move('0-0-0');

		// validate event
		assert.ok(castleEvent);
		assert.strictEqual(castleEvent.length, 1);
	});

	// test castle left
	it('should properly notate white King castle left as letters when PGN is true', () => {
		let
			castleEvent = [],
			gc = AlgebraicGameClient.create({ PGN : true }),
			s = null;

		gc.on('castle', (ev) => castleEvent.push(ev));

		gc.game.board.getSquare('b1').piece = null;
		gc.game.board.getSquare('c1').piece = null;
		gc.game.board.getSquare('d1').piece = null;

		s = gc.getStatus(true);

		assert.ok(typeof s.notatedMoves['O-O-O'] !== 'undefined', 'O-O-O');

		// perform castle move
		gc.move('O-O-O');

		// validate event
		assert.ok(castleEvent);
		assert.strictEqual(castleEvent.length, 1);
	});

	// test castle right
	it('should properly notate black King castle right and trigger event', () => {
		let
			castleEvent = [],
			gc = AlgebraicGameClient.create(),
			s = null;

		gc.on('castle', (ev) => castleEvent.push(ev));

		gc.game.board.getSquare('f8').piece = null;
		gc.game.board.getSquare('g8').piece = null;
		gc.getStatus(true);
		gc.move('a4');
		s = gc.getStatus();

		assert.ok(typeof s.notatedMoves['0-0'] !== 'undefined', '0-0');

		// perform castle move
		gc.move('0-0');

		// validate event
		assert.ok(castleEvent);
		assert.strictEqual(castleEvent.length, 1);
	});

	// test castle right
	it('should properly notate black King castle right as letters when PGN is true', () => {
		let
			castleEvent = [],
			gc = AlgebraicGameClient.create({ PGN : true }),
			s = null;

		gc.on('castle', (ev) => castleEvent.push(ev));

		gc.game.board.getSquare('f8').piece = null;
		gc.game.board.getSquare('g8').piece = null;
		gc.getStatus(true);
		gc.move('a4');
		s = gc.getStatus();

		assert.ok(typeof s.notatedMoves['O-O'] !== 'undefined', 'O-O');

		// perform castle move
		gc.move('O-O');

		// validate event
		assert.ok(castleEvent);
		assert.strictEqual(castleEvent.length, 1);
	});

	// validate parse notation with O-O-O
	it('should properly recognize white King castle left notation', () => {
		let
			gc = AlgebraicGameClient.create(),
			m = null;

		gc.game.board.getSquare('b1').piece = null;
		gc.game.board.getSquare('c1').piece = null;
		gc.game.board.getSquare('d1').piece = null;
		gc.getStatus(true);
		m = gc.move('O-O-O');

		assert.ok(m !== null, 'parse O-O-O');
		assert.ok(m.move.castle);
	});

	// validate parse notation with O-O-O
	it('should properly recognize white King castle left notation when PGN is true', () => {
		let
			gc = AlgebraicGameClient.create({ PGN : true }),
			m = null;

		gc.game.board.getSquare('b1').piece = null;
		gc.game.board.getSquare('c1').piece = null;
		gc.game.board.getSquare('d1').piece = null;
		gc.getStatus(true);
		m = gc.move('0-0-0');

		assert.ok(m !== null, 'parse 0-0-0');
		assert.ok(m.move.castle);
	});

	// validate parse notation with O-O
	it('should properly recognize black King castle right notation', () => {
		let
			gc = AlgebraicGameClient.create(),
			m = null;

		gc.game.board.getSquare('f8').piece = null;
		gc.game.board.getSquare('g8').piece = null;
		gc.getStatus(true);
		gc.move('a4');
		m = gc.move('O-O');

		assert.ok(m !== null, 'parse O-O');
		assert.ok(m.move.castle);
	});

	// validate parse notation with O-O
	it('should properly recognize black King castle right notation when PGN is true', () => {
		let
			gc = AlgebraicGameClient.create(),
			m = null;

		gc.game.board.getSquare('f8').piece = null;
		gc.game.board.getSquare('g8').piece = null;
		gc.getStatus(true);
		gc.move('a4');
		m = gc.move('0-0');

		assert.ok(m !== null, 'parse 0-0');
		assert.ok(m.move.castle);
	});

	// test pawn promotion
	// adding for issue #6
	it('should properly show valid White Pawn promotions', () => {
		let
			gc = AlgebraicGameClient.create(),
			r = null;

		gc.game.board.getSquare('a7').piece = null;
		gc.game.board.getSquare('a8').piece = null;
		gc.game.board.getSquare('a2').piece = null;
		gc.game.board.getSquare('a7').piece = Piece.createPawn(SideType.White);
		gc.game.board.getSquare('a7').piece.moveCount = 1;

		r = gc.getStatus(true);

		assert.isUndefined(r.notatedMoves['a8'], 'pawn should promote');
		assert.isDefined(r.notatedMoves['a8R'], 'pawn promotion to rook');
		assert.isDefined(r.notatedMoves['a8N'], 'pawn promotion to Knight');
		assert.isDefined(r.notatedMoves['a8B'], 'pawn promotion to Bishop');
		assert.isDefined(r.notatedMoves['a8Q'], 'pawn promotion to Queen');
	});

	it('should properly show valid Black Pawn promotions', () => {
		let
			gc = AlgebraicGameClient.create(),
			r = null;

		gc.game.board.getSquare('a2').piece = null;
		gc.game.board.getSquare('a1').piece = null;
		gc.game.board.getSquare('a7').piece = null;
		gc.game.board.getSquare('a2').piece = Piece.createPawn(SideType.Black);
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
	it('should properly recognize White Pawn promotion to Rook', () => {
		let
			gc = AlgebraicGameClient.create(),
			m = null,
			r = null;

		gc.game.board.getSquare('a7').piece = null;
		gc.game.board.getSquare('a8').piece = null;
		gc.game.board.getSquare('b8').piece = null;
		gc.game.board.getSquare('c8').piece = null;
		gc.game.board.getSquare('d8').piece = null;
		gc.game.board.getSquare('a2').piece = null;
		gc.game.board.getSquare('a7').piece = Piece.createPawn(SideType.White);
		gc.game.board.getSquare('a7').piece.moveCount = 1;

		gc.getStatus(true);
		m = gc.move('a8R');
		r = gc.getStatus();

		assert.strictEqual(m.move.postSquare.piece.type, PieceType.Rook);
		assert.strictEqual(r.isCheckmate, true);
		assert.strictEqual(gc.game.moveHistory[0].promotion, true);
	});

	// test pawn promotion
	it('should properly recognize Black Pawn promotion to Rook', () => {
		let
			gc = AlgebraicGameClient.create(),
			m = null,
			r = null;

		gc.game.board.getSquare('a2').piece = null;
		gc.game.board.getSquare('a1').piece = null;
		gc.game.board.getSquare('b1').piece = null;
		gc.game.board.getSquare('c1').piece = null;
		gc.game.board.getSquare('d1').piece = null;
		gc.game.board.getSquare('a7').piece = null;
		gc.game.board.getSquare('a2').piece = Piece.createPawn(SideType.Black);
		gc.game.board.getSquare('a2').piece.moveCount = 1;

		gc.getStatus(true);
		gc.move('h3');
		m = gc.move('a1R');
		r = gc.getStatus();

		assert.strictEqual(m.move.postSquare.piece.type, PieceType.Rook);
		assert.strictEqual(r.isCheckmate, true);
		assert.strictEqual(gc.game.moveHistory[0].promotion, false);
		assert.strictEqual(gc.game.moveHistory[1].promotion, true);
	});

	// test pawn promotion event
	it('should properly fire Pawn promotion event', () => {
		let
			gc = AlgebraicGameClient.create(),
			promoteEvent = [];

		gc.on('promote', (ev) => promoteEvent.push(ev));

		gc.game.board.getSquare('a7').piece = null;
		gc.game.board.getSquare('a8').piece = null;
		gc.game.board.getSquare('b8').piece = null;
		gc.game.board.getSquare('c8').piece = null;
		gc.game.board.getSquare('d8').piece = null;
		gc.game.board.getSquare('a2').piece = null;
		gc.game.board.getSquare('a7').piece = Piece.createPawn(SideType.White);
		gc.game.board.getSquare('a7').piece.moveCount = 1;

		gc.getStatus(true);
		gc.move('a8R');

		assert.strictEqual(gc.game.moveHistory[0].promotion, true);
		assert.strictEqual(promoteEvent.length, 1);
	});

	// test ambiguous notation
	it('should throw exception when notation is too ambiguous to determine which piece to move', () => {
		let gc = AlgebraicGameClient.create();

		gc.move('a4');
		gc.move('a5');
		gc.move('h4');
		gc.move('h5');
		gc.move('Ra3');
		gc.move('Ra6');

		assert.throws(() => {
			gc.move('Rh3');
		}); // could be Rhh3 or Rah3
	});

	// test invalid notation
	it('should throw an exception when the notation provided is fail', () => {
		let gc = AlgebraicGameClient.create();

		assert.throws(() => {
			gc.move('h6');
		});
		assert.throws(() => {
			gc.move('z9');
		});
	});

	// test overly specified notation
	it('should properly parse overly verbose notation', () => {
		let
			gc = AlgebraicGameClient.create(),
			m = null;

		m = gc.move('Nb1c3');

		assert.ok(m !== null);
		assert.strictEqual(m.move.postSquare.file, 'c');
		assert.strictEqual(m.move.postSquare.rank, 3);
		assert.strictEqual(m.move.postSquare.piece.type, PieceType.Knight);
	});

	// Issue #1 - Ensure no phantom pawns appear after sequence of moves in AlgebraicGameClient
	it('should not have a random Pawn appear on the board after a specific sequence of moves (bug fix test)', () => {
		let
			gc = AlgebraicGameClient.create(),
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
		gc.move('Bxc6');

		assert.ok(s.piece === null, 'Phantom piece appears after Bxc6');
	});

	// Issue #3 - Ensure no phantom pawns appear after sequence of moves
	it('should not have a random Black Pawn appear on the board (bug fix test)', () => {
		let
			gc = AlgebraicGameClient.create(),
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

		gc.move('Rg6');

		assert.ok(s.piece === null, 'Phantom piece appears after Rg6');
	});

	// Issue #4 - Ensure proper checkmate detection with Knight
	it('should properly detect checkmate', () => {
		let
			gc = AlgebraicGameClient.create(),
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
		assert.ok(typeof status.notatedMoves['Kf7'] === 'undefined');
	});

	// Issue #8 - Ensure no extraneous Black Pawn
	it('should not have a random Black Pawn appear on the board (bug fix test)', () => {
		let
			gc = AlgebraicGameClient.create(),
			s = gc.game.board.getSquare('e6');

		gc.move('d4');
		gc.move('a6');


		gc.move('d5');

		assert.ok(s.piece === null, 'phantom piece appears before e5');

		gc.move('e5');

		assert.ok(s.piece === null, 'phantom piece appears after e5');
	});

	// Issue #15 - Ensure Pawn can move two spaces correctly on the first move
	it('should not block first move of two squares by Pawns incorrectly (bug fix test)', () => {
		let
			gc = AlgebraicGameClient.create(),
			status;

		gc.move('e4');
		gc.move('a5');

		gc.move('Ba6');

		status = gc.getStatus();

		assert.isDefined(status.notatedMoves['b5'], 'Pawn able to advance two squares');
	});

	// Issue #17 - Move pawn to promotion, other pieces of same color should not have promotion
	it('should properly notate future promotions after the first promotion (bug fix test)', () => {
		let
			gc = AlgebraicGameClient.create(),
			r = null;

		gc.game.board.getSquare('c7').piece = null;
		gc.game.board.getSquare('c8').piece = null;
		gc.game.board.getSquare('c2').piece = null;
		gc.game.board.getSquare('c7').piece = Piece.createPawn(SideType.White);
		gc.game.board.getSquare('c7').piece.moveCount = 1;
		gc.game.board.getSquare('h7').piece = null;
		gc.game.board.getSquare('h7').piece = Piece.createBishop(SideType.White);
		gc.game.board.getSquare('h7').piece.moveCount = 1;

		// force recalculation of board position
		r = gc.getStatus(true);

		// make sure only Pawns can be promoted
		assert.isDefined(r.notatedMoves['cxb8R'], 'pawn promotion to rook');
		assert.isDefined(r.notatedMoves['cxb8N'], 'pawn promotion to Knight');
		assert.isDefined(r.notatedMoves['cxb8B'], 'pawn promotion to Bishop');
		assert.isDefined(r.notatedMoves['cxb8Q'], 'pawn promotion to Queen');
		assert.isDefined(r.notatedMoves['cxd8R'], 'pawn promotion to rook');
		assert.isDefined(r.notatedMoves['cxd8N'], 'pawn promotion to Knight');
		assert.isDefined(r.notatedMoves['cxd8B'], 'pawn promotion to Bishop');
		assert.isDefined(r.notatedMoves['cxd8Q'], 'pawn promotion to Queen');
		assert.isUndefined(r.notatedMoves['Bxg8R'], 'Bishop should not promote');
	});

	// Issue #18 - Missing Pawn promotion moves
	it('should properly notate future promotions after the first promotion (bug fix test)', () => {
		let
			gc = AlgebraicGameClient.create(),
			r = null;

		// position the board for a promotion next move
		gc.game.board.getSquare('c7').piece = null;
		gc.game.board.getSquare('c2').piece = null;
		gc.game.board.getSquare('c7').piece = Piece.createPawn(SideType.White);
		gc.game.board.getSquare('c7').piece.moveCount = 1;

		// force recalculation of board position
		r = gc.getStatus(true);

		// make sure Pawn promotions are present
		assert.isUndefined(r.notatedMoves['cxb8'], 'pawn should promote');
		assert.isDefined(r.notatedMoves['cxb8Q'], 'should allow promote to queen');
		assert.isDefined(r.notatedMoves['cxb8R'], 'should allow promote to rook');
		assert.isDefined(r.notatedMoves['cxb8B'], 'should allow promote to bishop');
		assert.isDefined(r.notatedMoves['cxb8N'], 'should allow promote to knight');
	});

	// Issue #23 - Show who is attacking the King
	it('should properly emit check and indicate attackers of the King', () => {
		let
			checkResult = null,
			gc = AlgebraicGameClient.create(),
			r = null;

		gc.on('check', (result) => (checkResult = result));

		// position the board for a promotion next move
		gc.game.board.getSquare('b1').piece = null;
		gc.game.board.getSquare('f6').piece = Piece.createKnight(SideType.White);
		gc.game.board.getSquare('f6').piece.moveCount = 1;

		// move to trigger evaluation that King is check
		gc.move('a3');

		// force recalculation of board position
		r = gc.getStatus(true);

		// make sure Pawn promotions are present
		assert.isDefined(checkResult);
		assert.strictEqual(checkResult.attackingSquare.piece.type, PieceType.Knight);
		assert.isDefined(r.notatedMoves['exf6'], 'should allow capture of attacking Knight');
		assert.isDefined(r.notatedMoves['gxf6'], 'should allow capture of attacking Knight');
		assert.isDefined(r.notatedMoves['Nxf6'], 'should allow capture of attacking Knight');
	});

	// Issue #43 - Parser can't handle PGN notation for gxf3+
	/*
	[Event "Gibraltar Masters 2019"]
	[Site "Caleta ENG"]
	[Date "2019.01.22"]
	[Round "1.110"]
	[White "Bianco,V"]
	[Black "Larino Nieto,D"]
	[Result "0-1"]
	[WhiteElo "2018"]
	[BlackElo "2432"]
	[ECO "C41"]

	1.d4 d6 2.e4 Nf6 3.Nc3 e5 4.Nf3 Nbd7 5.Bc4 Nb6 6.dxe5 Nxc4 7.exf6 Qxf6 8.Bg5 Nxb2
	9.Qd2 Qe6 10.Nd5 Qxe4+ 11.Kf1 Qc4+ 12.Kg1 Be6 13.Ne3 Qc5 14.Rb1 Na4 15.c4 Nb6
	16.Qb2 h6 17.Bh4 Rg8 18.Nd4 g5 19.Nxe6 fxe6 20.Qf6 Qe5 21.Qxe5 dxe5 22.Bg3 O-O-O
	23.Bxe5 Bc5 24.h4 g4 25.Kh2 Rd2 26.Kg3 Nd7 27.Bb2 Bd6+ 28.f4 gxf3+ 29.Kxf3 Rg3+
	30.Ke4 Nc5+  0-1
	//*/
	it('should properly handle notation that is similar to gxf3+', () => {
		let
			gc = AlgebraicGameClient.create(),
			status;

		gc.move('d4');
		gc.move('d6');

		gc.move('e4');
		gc.move('Nf6');

		gc.move('Nc3');
		gc.move('e5');

		gc.move('Nf3');
		gc.move('Nbd7');

		gc.move('Bc4');
		gc.move('Nb6');

		gc.move('dxe5');
		gc.move('Nxc4');

		gc.move('exf6');
		gc.move('Qxf6');

		gc.move('Bg5');
		gc.move('Nxb2');

		gc.move('Qd2');
		gc.move('Qe6');

		gc.move('Nd5');
		gc.move('Qxe4+');

		gc.move('Kf1');
		gc.move('Qc4+');

		gc.move('Kg1');
		gc.move('Be6');

		gc.move('Ne3');
		gc.move('Qc5');

		gc.move('Rb1');
		gc.move('Na4');

		gc.move('c4');
		gc.move('Nb6');

		gc.move('Qb2');
		gc.move('h6');

		gc.move('Bh4');
		gc.move('Rg8');

		gc.move('Nd4');
		gc.move('g5');

		gc.move('Nxe6');
		gc.move('fxe6');

		gc.move('Qf6');
		gc.move('Qe5');

		gc.move('Qxe5');
		gc.move('dxe5');

		gc.move('Bg3');
		gc.move('O-O-O');

		gc.move('Bxe5');
		gc.move('Bc5');

		gc.move('h4');
		gc.move('g4');

		gc.move('Kh2');
		gc.move('Rd2');

		gc.move('Kg3');
		gc.move('Nd7');

		gc.move('Bb2');
		gc.move('Bd6+');

		gc.move('f4');
		// #43 - test previoulsy failed here: unable to parse gxf3+ and reduced notation to gf3 to retry parse
		gc.move('gxf3+');

		gc.move('Kxf3');
		gc.move('Rg3+');

		gc.move('Ke4');
		gc.move('Nc5+');

		status = gc.getStatus();
		assert.ok(status.isCheckmate, 'should properly parse gxf3+');
	});

	// Issue #53
	// Algebraic and PGN formatting of en Passant is not correct
	it('should properly notate en Passant and trigger event', () => {
		let
			enPassantEvent = [],
			gc = AlgebraicGameClient.create(),
			status;

		gc.on('enPassant', (ev) => enPassantEvent.push(ev));

		gc.move('e4');
		gc.move('d5');
		gc.move('e5');
		gc.move('f5');

		status = gc.getStatus();

		assert.isUndefined(status.notatedMoves['f6'], 'should properly notate en Passant');
		assert.isDefined(status.notatedMoves['exf6'], 'should properly notate en Passant');

		// make the en Passant move
		gc.move('exf6');

		assert.ok(enPassantEvent);
		assert.strictEqual(enPassantEvent.length, 1);
	});

	// getFen test
	it('should properly generate FEN of start position', () => {
		let
			fen = null,
			gc = AlgebraicGameClient.create();

		fen = gc.getFen();

		assert.strictEqual(fen, 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR');
	});

	// Issue #71 - move.undo() does not properly update game statusß
	it('should properly return game client to the correct state when calling undo', () => {
		let client = AlgebraicGameClient.create();

		client.move('e4');
		client.move('c5').undo();

		let sts = client.getStatus();
		assert.ok((sts.board.lastMovedPiece.side.name === 'white'), 'previously moved piece should reflect the piece before the last move occurred');
		assert.ok(sts.notatedMoves['c5'], 'available moves should include move that was undone');
	});

	// Issue #77 - move.undo() fails on first move
	it('should properly undo the first move without error', () => {
		let client = AlgebraicGameClient.create();

		client.move('e4').undo();

		let sts = client.getStatus();

		assert.ok(sts.notatedMoves['e4'], 'available moves should include move that was undone');
	});
});
