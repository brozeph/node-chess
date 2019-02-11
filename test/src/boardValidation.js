/* eslint no-magic-numbers:0 */

import { BoardValidation } from '../../src/boardValidation';
import { Game } from '../../src/game';

describe('BoardValidation', () => {
	let getValidSquares = (sq, validMoves) => {
		let i = 0;

		for (; i < validMoves.length; i++) {
			if (validMoves[i].src === sq) {
				return validMoves[i].squares;
			}
		}
	};

	// validate error creating BoardValidation when board is null
	it('should fail if validation object is created without a valid board', () => {
		let bv = BoardValidation.create(null);

		bv.start((err) => {
			assert.ok(err);
			assert.strictEqual(err.message, 'board is invalid');
		});
	});

	// ensure board and game set properly when BoardValidation is created
	it('should properly reflect board and game when validation object is created', () => {
		let
			b,
			bv,
			g = Game.create();

		b = g.board;
		bv = BoardValidation.create(g);

		assert.strictEqual(bv.board, b);
	});

	// ensure validation returns appropriate piece move options based on turn
	it('should properly indicate that a white Pawn has 2 valid moves', () => {
		let
			b,
			bv,
			g = Game.create(),
			squares = [];

		b = g.board;
		bv = BoardValidation.create(g);

		bv.start((err, validMoves) => {
			if (err) {
				throw err;
			}

			squares = getValidSquares(
				b.getSquare('e', 2),
				validMoves);

			assert.strictEqual(squares.length, 2);
		});
	});

	// ensure validation returns appropriate piece move options based on turn
	it('testBoardValidation_BlackPawn_NoValidMoves', () => {
		let
			b,
			bv,
			g = Game.create(),
			squares = [];

		b = g.board;
		bv = BoardValidation.create(g);

		bv.start((err, validMoves) => {
			if (err) {
				throw err;
			}

			squares = getValidSquares(
				b.getSquare('e', 7),
				validMoves);

			assert.ok(typeof squares === 'undefined');
		});
	});

	// validate is square attacked on piece not being attacked
	it('testBoardValidation_WhiteKing_IsNotAttacked', () => {
		let
			b,
			bv,
			g = Game.create(),
			kingSquare;

		b = g.board;
		bv = BoardValidation.create(g);
		kingSquare = b.getSquare('e', 1);

		assert.strictEqual(bv.isSquareAttacked(kingSquare), false);
	});

	// validate is square attacked on piece being attacked
	it('testBoardValidation_BlackPawn_IsAttacked', () => {
		let
			b,
			bv,
			g = Game.create();

		b = g.board;
		bv = BoardValidation.create(g);

		b.move(b.getSquare('d', 2), b.getSquare('d', 4));
		b.move(b.getSquare('d', 7), b.getSquare('d', 5));
		b.move(b.getSquare('c', 1), b.getSquare('g', 5));

		assert.strictEqual(bv.isSquareAttacked(b.getSquare('e', 7)), true);
	});

	// ensure is square attacked accurately tracks king being attacked
	it('testBoardValidation_BlackKing_IsAttacked', () => {
		let
			b,
			bv,
			g = Game.create();

		b = g.board;
		bv = BoardValidation.create(g);

		b.move(b.getSquare('e', 2), b.getSquare('e', 4));
		b.move(b.getSquare('f', 7), b.getSquare('f', 5));
		b.move(b.getSquare('d', 1), b.getSquare('h', 5));

		assert.strictEqual(bv.isSquareAttacked(b.getSquare('e', 8)), true);
	});

	// ensure is square attacked accurately tracks that's it not being attacked
	// based on bug found where board logic thought square was attacked by pawn more
	// than 1 square away diagonally
	it('testBoardValidation_BlackKing_IsNotAttacked', () => {
		let
			b,
			bv,
			g = Game.create();

		b = g.board;
		bv = BoardValidation.create(g);

		b.move('g2', 'g4');
		b.move('f7', 'f6');
		b.move('g4', 'g5');
		b.move('f6', 'f5');
		b.move('g5', 'g6');

		assert.strictEqual(bv.isSquareAttacked(b.getSquare('e', 8)), false);
	});

	// validate castle rule to left
	it('testBoardValidation_WhiteKingCastle_Left', () => {
		let
			b,
			bv,
			g = Game.create(),
			squares = [];

		b = g.board;
		bv = BoardValidation.create(g);

		b.getSquare('b', 1).piece = null;
		b.getSquare('c', 1).piece = null;
		b.getSquare('d', 1).piece = null;

		bv.start((err, validMoves) => {
			if (err) {
				throw err;
			}

			squares = getValidSquares(
				b.getSquare('e', 1),
				validMoves);

			assert.strictEqual(squares.length, 2);
			assert.strictEqual(squares[1].file, 'c');
		});
	});

	// validate castle rule to right
	it('testBoardValidation_BlackKingCastle_Right', () => {
		let
			b,
			bv,
			g = Game.create(),
			squares = [];

		b = g.board;
		bv = BoardValidation.create(g);

		b.getSquare('f', 8).piece = null;
		b.getSquare('g', 8).piece = null;

		b.move(b.getSquare('a', 2), b.getSquare('a', 4));

		bv.start((err, validMoves) => {
			if (err) {
				throw err;
			}

			squares = getValidSquares(
				b.getSquare('e', 8),
				validMoves);

			assert.strictEqual(squares.length, 2);
			assert.strictEqual(squares[1].file, 'g');
		});
	});

	// validate castle rule no longer applies when king has moved
	it('testBoardValidation_WhiteKingCastle_KingMoved', () => {
		let
			b,
			bv,
			g = Game.create(),
			squares = [];

		b = g.board;
		bv = BoardValidation.create(g);

		// clear squares between king and rook
		b.getSquare('f', 1).piece = null;
		b.getSquare('g', 1).piece = null;

		// move king
		b.move(b.getSquare('e', 1), b.getSquare('f', 1));
		b.move(b.getSquare('f', 1), b.getSquare('e', 1));

		bv.start((err, validMoves) => {
			if (err) {
				throw err;
			}

			squares = getValidSquares(
				b.getSquare('e', 1),
				validMoves);

			assert.strictEqual(squares.length, 1);
		});
	});

	// validate castle rule no longer applies when rook has moved
	it('testBoardValidation_WhiteKingCastle_RookMoved', () => {
		let
			b,
			bv,
			g = Game.create(),
			squares = [];

		b = g.board;
		bv = BoardValidation.create(g);

		// clear squares between king and rook
		b.getSquare('f', 1).piece = null;
		b.getSquare('g', 1).piece = null;

		// move rook
		b.move(b.getSquare('h', 1), b.getSquare('f', 1));
		b.move(b.getSquare('f', 1), b.getSquare('h', 1));

		bv.start((err, validMoves) => {
			if (err) {
				throw err;
			}

			squares = getValidSquares(
				b.getSquare('e', 1),
				validMoves);

			assert.strictEqual(squares.length, 1);
		});
	});

	// validate only move options are to block check
	it('testBoardValidation_WhiteKingInCheck_BlockMovesOnly', () => {
		let
			b,
			bishopSquare,
			bv,
			g = Game.create(),
			knightSquare,
			queenSquare,
			squares = [];

		b = g.board;
		bishopSquare = b.getSquare('f', 1);
		bv = BoardValidation.create(g);
		knightSquare = b.getSquare('g', 1);
		queenSquare = b.getSquare('d', 1);

		// put king in check
		b.getSquare('e', 2).piece = null;
		b.getSquare('e', 7).piece = null;
		b.move(b.getSquare('d', 8), b.getSquare('e', 7), true);

		bv.start((err, validMoves) => {
			if (err) {
				throw err;
			}

			squares = getValidSquares(queenSquare, validMoves);
			assert.strictEqual(squares.length, 1);

			squares = getValidSquares(bishopSquare, validMoves);
			assert.strictEqual(squares.length, 1);

			squares = getValidSquares(knightSquare, validMoves);
			assert.strictEqual(squares.length, 1);

			assert.strictEqual(validMoves.length, 3);
		});
	});

	it('should properly trigger game to emit check when King is placed in check', () => {
		let
			b,
			bv,
			checkResult = [],
			g = Game.create();

		b = g.board;
		bv = BoardValidation.create(g);

		// capture check event
		g.on('check', (result) => (checkResult.push(result)));

		// prepare board by eliminating two Pawns
		b.getSquare('e', 2).piece = null;
		b.getSquare('e', 7).piece = null;

		// arrange double check scenario via reveal
		b.move(b.getSquare('b', 1), b.getSquare('c', 3));
		b.move(b.getSquare('a', 7), b.getSquare('a', 6));

		b.move(b.getSquare('c', 3), b.getSquare('e', 4));
		b.move(b.getSquare('a', 6), b.getSquare('a', 5));

		// Queen preparing to put in check
		b.move(b.getSquare('d', 1), b.getSquare('e', 2));
		b.move(b.getSquare('a', 5), b.getSquare('a', 4));

		// double-check (a checkmate... Queen and Knight both attacking)
		b.move(b.getSquare('e', 4), b.getSquare('f', 6));

		bv.start((err) => {
			if (err) {
				throw err;
			}

			assert.ok(checkResult);
			// TODO: Should emit two events, not a single event with an array of attackers...
			assert.strictEqual(checkResult.length, 2);
		});
	});

	// validate inability to castle while king is in check
	it('testBoardValidation_WhiteKingCastle_KingInCheck', () => {
		let
			b,
			bv,
			g = Game.create(),
			squares = [];

		b = g.board;
		bv = BoardValidation.create(g);

		// clear squares between king and rook
		b.getSquare('f', 1).piece = null;
		b.getSquare('g', 1).piece = null;

		// put king in check
		b.getSquare('e', 2).piece = null;
		b.getSquare('e', 7).piece = null;
		b.move(b.getSquare('d', 8), b.getSquare('e', 7), true);

		bv.start((err, validMoves) => {
			if (err) {
				throw err;
			}

			squares = getValidSquares(
				b.getSquare('e', 1),
				validMoves);

			assert.strictEqual(squares.length, 1);
		});
	});

	// validate inability to castle through or into check
	it('testBoardValidation_WhiteKingCastle_MoveThroughCheck', () => {
		let
			b,
			bv,
			g = Game.create(),
			squares = [];

		b = g.board;
		bv = BoardValidation.create(g);

		// clear squares between king and rook
		b.getSquare('f', 1).piece = null;
		b.getSquare('g', 1).piece = null;

		// put attacker in castle path
		b.getSquare('f', 2).piece = null;
		b.getSquare('e', 7).piece = null;
		b.move(b.getSquare('d', 8), b.getSquare('f', 6), true);

		bv.start((err, validMoves) => {
			if (err) {
				throw err;
			}

			squares = getValidSquares(
				b.getSquare('e', 1),
				validMoves);

			assert.ok(typeof squares === 'undefined');
		});
	});

	// validate inability to move into check
	it('testBoardValidation_WhiteKing_UnableToExposeCheck', () => {
		let
			b,
			bv,
			g = Game.create(),
			squares = [];

		b = g.board;
		bv = BoardValidation.create(g);

		// block king with knight and attack with queen
		b.getSquare('e', 2).piece = null;
		b.getSquare('e', 7).piece = null;
		b.move(b.getSquare('d', 8), b.getSquare('e', 7), true);
		b.move(b.getSquare('g', 1), b.getSquare('e', 2), true);

		bv.start((err, validMoves) => {
			if (err) {
				throw err;
			}

			squares = getValidSquares(
				b.getSquare('e', 2),
				validMoves);

			assert.ok(typeof squares === 'undefined');
		});
	});

	// validate checkmate (no available moves)
	it('testBoardValidation_BlackKing_Checkmate', () => {
		let
			b,
			bv,
			g = Game.create();

		b = g.board;
		bv = BoardValidation.create(g);

		// put king into checkmate
		b.move(b.getSquare('e', 2), b.getSquare('e', 4));
		b.move(b.getSquare('f', 7), b.getSquare('f', 6));
		b.move(b.getSquare('d', 2), b.getSquare('d', 4));
		b.move(b.getSquare('g', 7), b.getSquare('g', 5));
		b.move(b.getSquare('d', 1), b.getSquare('h', 5));

		bv.start((err, validMoves) => {
			if (err) {
				throw err;
			}

			assert.strictEqual(validMoves.length, 0);
		});
	});

	// validate pieces don't disappear after validation
	it('testBoardValidation_Pawn_Disappears', () => {
		let
			b,
			bv,
			g = Game.create();

		b = g.board;
		bv = BoardValidation.create(g);

		b.move('e2', 'e4');
		b.move('e7', 'e6');
		b.move('d2', 'd4');
		b.move('d7', 'd5');

		bv.start(() => {
			assert.ok(b.getSquare('d4').piece !== null);
		});

		b.move('b1', 'c3');

		bv.start(() => {
			assert.ok(b.getSquare('d4').piece !== null, 'pawn has disappeared during validation');
		});
	});
});
