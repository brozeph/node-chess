/* eslint no-magic-numbers:0 */
import { assert, describe, it } from 'vitest';
import { Board, NeighborType } from '../../src/board.js';
import { PieceType, SideType } from '../../src/piece.js';

describe('Board', () => {
	describe('#create()', () => {
		// ensure 64 squares
		it('should return 64 squares', () => {
			let b = Board.create();
			assert.strictEqual(b.squares.length, 64);
		});
	});

	describe('#load(FEN)', () => {
		// ensure 64 squares
		it('should return 64 squares', () => {
			let b = Board.load('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR');
			assert.strictEqual(b.squares.length, 64);
		});
	});

	describe('#getSquare()', () => {
		// ensure squares retrieved via getSquare are correct
		it('should be square a1', () => {
			let
				b = Board.create(),
				s = b.getSquare('a', 1);

			assert.strictEqual(s.rank, 1);
			assert.strictEqual(s.file, 'a');
		});

		// ensure shorthand for getSquare works as expected
		it('should be square a1 via shorthand', () => {
			let
				b = Board.create(),
				s = b.getSquare('a1');

			assert.strictEqual(s.rank, 1);
			assert.strictEqual(s.file, 'a');
		});

		// ensure squares retrieved via getSquare are correct
		it('should be square a8', () => {
			let
				b = Board.create(),
				s = b.getSquare('a', 8);

			assert.strictEqual(s.rank, 8);
			assert.strictEqual(s.file, 'a');
		});

		// ensure squares retrieved via getSquare are correct
		it('should be square h1', () => {
			let
				b = Board.create(),
				s = b.getSquare('h', 1);

			assert.strictEqual(s.rank, 1);
			assert.strictEqual(s.file, 'h');
		});

		// ensure squares retrieved via getSquare are correct
		it('should be square h8', () => {
			let
				b = Board.create(),
				s = b.getSquare('h', 8);

			assert.strictEqual(s.rank, 8);
			assert.strictEqual(s.file, 'h');
		});

		// ensure squares retrieved via getSquare are correct
		it('should be square 5e', () => {
			let
				b = Board.create(),
				s = b.getSquare('e', 5);

			assert.strictEqual(s.rank, 5);
			assert.strictEqual(s.file, 'e');
		});

		// ensure squares requested with invalid data are null
		it('should be null square (invalid rank)', () => {
			let b = Board.create();

			assert.equal(b.getSquare('a', 0), null);
		});

		// ensure squares requested with invalid data are null
		it('should be null square (invalid file)', () => {
			let b = Board.create();

			assert.equal(b.getSquare('i', 1), null);
		});

		// ensure corrupted board returns null square
		it('should be null square (corrupted board)', () => {
			let b = Board.create();
			b.squares = [];

			assert.equal(b.getSquare('a', 1), null);
		});
	});

	describe('#getSquare().piece', () => {
		// ensure pieces are placed properly on squares
		it('should be White King on e1', () => {
			let
				b = Board.create(),
				p = b.getSquare('e', 1).piece;

			assert.strictEqual(p.type, PieceType.King);
			assert.strictEqual(p.side, SideType.White);
		});

		// ensure pieces are placed properly on squares
		it('should be Black Queen on d8', () => {
			let
				b = Board.create(),
				p = b.getSquare('d', 8).piece;

			assert.strictEqual(p.type, PieceType.Queen);
			assert.strictEqual(p.side, SideType.Black);
		});

		// ensure moveCount of piece isn't incremented during Board.create()
		it('should be White Pawn with move count of 0', () => {
			let
				b = Board.create(),
				p = b.getSquare('d', 2).piece;

			assert.strictEqual(p.type, PieceType.Pawn);
			assert.strictEqual(p.side, SideType.White);
			assert.strictEqual(p.moveCount, 0);
		});
	});

	describe('#getSquares(SideType)', () => {
		// validate getSquares(SideType) works correctly
		it('should return all White squares', () => {
			let
				b = Board.create(),
				i = 0,
				kingCount = 0,
				pawnCount = 0,
				squares = b.getSquares(SideType.White);

			assert.strictEqual(squares.length, 16);
			assert.strictEqual(squares[i].piece.side, SideType.White);

			for (; i < squares.length; i++) {
				if (squares[i].piece.type === PieceType.Pawn) {
					pawnCount++;
				} else if (squares[i].piece.type === PieceType.King) {
					kingCount++;
				}
			}

			assert.strictEqual(pawnCount, 8);
			assert.strictEqual(kingCount, 1);
		});

		// validate getSquares(SideType) works correctly
		it('should return all Black squares', () => {
			let
				b = Board.create(),
				i = 0,
				kingCount = 0,
				pawnCount = 0,
				squares = b.getSquares(SideType.Black);

			assert.strictEqual(squares.length, 16);
			assert.strictEqual(squares[i].piece.side, SideType.Black);

			for (; i < squares.length; i++) {
				if (squares[i].piece.type === PieceType.Pawn) {
					pawnCount++;
				} else if (squares[i].piece.type === PieceType.King) {
					kingCount++;
				}
			}

			assert.strictEqual(pawnCount, 8);
			assert.strictEqual(kingCount, 1);
		});
	});

	describe('#getNeighborSquare(NeighborType)', () => {
		// validate getSquares(SideType) works correctly
		it('should return square e3 when going above e2', () => {
			let
				b = Board.create(),
				sq1 = b.getSquare('e', 2),
				sq2 = b.getNeighborSquare(sq1, NeighborType.Above);

			assert.strictEqual(sq2.rank, 3);
			assert.strictEqual(sq2.file, 'e');
		});

		// verify getNeighborSquare(NeighborType) returns null for invalid boundaries
		it('should return null square when going above a8', () => {
			let
				b = Board.create(),
				sq1 = b.getSquare('a', 8),
				sq2 = b.getNeighborSquare(sq1, NeighborType.Above);

			assert.strictEqual(sq2, null);
		});

		// verify getNeighborSquare(NeighborType)
		it('should return square d3 when going above left of e2 ', () => {
			let
				b = Board.create(),
				sq1 = b.getSquare('e', 2),
				sq2 = b.getNeighborSquare(sq1, NeighborType.AboveLeft);

			assert.strictEqual(sq2.rank, 3);
			assert.strictEqual(sq2.file, 'd');
		});

		// verify getNeighborSquare(NeighborType)
		it('should return f3 square when going above left of e2', () => {
			let
				b = Board.create(),
				sq1 = b.getSquare('e', 2),
				sq2 = b.getNeighborSquare(sq1, NeighborType.AboveRight);

			assert.strictEqual(sq2.rank, 3);
			assert.strictEqual(sq2.file, 'f');
		});

		// verify getNeighborSquare(NeighborType)
		it('should return e1 square when going below of e2', () => {
			let
				b = Board.create(),
				sq1 = b.getSquare('e', 2),
				sq2 = b.getNeighborSquare(sq1, NeighborType.Below);

			assert.strictEqual(sq2.rank, 1);
			assert.strictEqual(sq2.file, 'e');
		});

		// verify getNeighborSquare(NeighborType) returns null for invalid boundaries
		it('should return null square below a1', () => {
			let
				b = Board.create(),
				sq1 = b.getSquare('a', 1),
				sq2 = b.getNeighborSquare(sq1, NeighborType.Below);

			assert.strictEqual(sq2, null);
		});

		// verify getNeighborSquare(NeighborType)
		it('should return d1 below left of e2', () => {
			let
				b = Board.create(),
				sq1 = b.getSquare('e', 2),
				sq2 = b.getNeighborSquare(sq1, NeighborType.BelowLeft);

			assert.strictEqual(sq2.rank, 1);
			assert.strictEqual(sq2.file, 'd');
		});

		// verify getNeighborSquare(NeighborType)
		it('should return f1 below right of e2', () => {
			let
				b = Board.create(),
				sq1 = b.getSquare('e', 2),
				sq2 = b.getNeighborSquare(sq1, NeighborType.BelowRight);

			assert.strictEqual(sq2.rank, 1);
			assert.strictEqual(sq2.file, 'f');
		});

		// verify getNeighborSquare(NeighborType)
		it('should return d2 left of e2', () => {
			let
				b = Board.create(),
				sq1 = b.getSquare('e', 2),
				sq2 = b.getNeighborSquare(sq1, NeighborType.Left);

			assert.strictEqual(sq2.rank, 2);
			assert.strictEqual(sq2.file, 'd');
		});

		// verify getNeighborSquare(NeighborType) returns null for invalid boundaries
		it('should return null square left of a2', () => {
			let
				b = Board.create(),
				sq1 = b.getSquare('a', 2),
				sq2 = b.getNeighborSquare(sq1, NeighborType.Left);

			assert.strictEqual(sq2, null);
		});

		// verify getNeighborSquare(NeighborType)
		it('should return f2 right of e2', () => {
			let
				b = Board.create(),
				sq1 = b.getSquare('e', 2),
				sq2 = b.getNeighborSquare(sq1, NeighborType.Right);

			assert.strictEqual(sq2.rank, 2);
			assert.strictEqual(sq2.file, 'f');
		});

		// verify getNeighborSquare(NeighborType) returns null for invalid boundaries
		it('should return null square right of h2', () => {
			let
				b = Board.create(),
				sq1 = b.getSquare('h', 2),
				sq2 = b.getNeighborSquare(sq1, NeighborType.Right);

			assert.strictEqual(sq2, null);
		});
	});

	describe('#move()', () => {
		// verify that moving a piece actually results in the piece being moved
		it('should have pieces on the correct squares after moving', () => {
			let b = Board.create();

			b.move(b.getSquare('e', 2), b.getSquare('e', 4));
			b.move(b.getSquare('f', 7), b.getSquare('f', 5));
			b.move(b.getSquare('d', 1), b.getSquare('h', 5));

			assert.strictEqual(b.getSquare('e', 4).piece.type, PieceType.Pawn);
			assert.strictEqual(b.getSquare('f', 5).piece.type, PieceType.Pawn);
			assert.strictEqual(b.getSquare('h', 5).piece.type, PieceType.Queen);
		});

		// ensure shorthand for move works as expected
		it('should support shorthand move', () => {
			let b = Board.create();

			b.move('e2', 'e4');

			assert.strictEqual(b.getSquare('e', 4).piece.type, PieceType.Pawn);
		});

		// verify simulation of move provides backout method that doesn't corrupt board
		it('should have non-corrupt board when backing out a simple move', () => {
			let
				b = Board.create(),
				r = b.move(b.getSquare('e', 2), b.getSquare('e', 4), true);

			assert.strictEqual(b.getSquare('e', 2).piece, null);
			assert.strictEqual(b.getSquare('e', 4).piece.type, PieceType.Pawn);

			r.undo();

			assert.strictEqual(b.getSquare('e', 4).piece, null);
			assert.strictEqual(b.getSquare('e', 2).piece.type, PieceType.Pawn);
		});

		it('should not emit an event when calling undo and move is simulated', () => {
			let
				b = Board.create(),
				mv,
				r = b.move(b.getSquare('e', 2), b.getSquare('e', 4), true);

			b.on('undo', (m) => {
				mv = m;
			});

			r.undo();

			assert.ok(typeof mv === 'undefined');
		});

		it('should emit an event when calling undo', () => {
			let
				b = Board.create(),
				mv,
				r = b.move(b.getSquare('e', 2), b.getSquare('e', 4));

			b.on('undo', (m) => {
				mv = m;
			});

			r.undo();

			assert.ok(mv);
		});

		it('should only allow undo to be called once', () => {
			let
				b = Board.create(),
				mv,
				r = b.move(b.getSquare('e', 2), b.getSquare('e', 4));

			b.on('undo', (m) => {
				mv = m;
			});

			r.undo();

			assert.throws(() => {
				mv.undo();
			});

			assert.throws(() => {
				r.undo();
			});
		});

		// validate board.move for en-passant and proper capture of opposing pawn
		it('should support en-passant', () => {
			let b = Board.create();

			b.move(b.getSquare('e', 2), b.getSquare('e', 4));
			b.move(b.getSquare('e', 7), b.getSquare('e', 6));
			b.move(b.getSquare('e', 4), b.getSquare('e', 5));
			b.move(b.getSquare('f', 7), b.getSquare('f', 5));
			b.move(b.getSquare('e', 5), b.getSquare('f', 6));

			assert.strictEqual(b.getSquare('f', 5).piece, null);
		});

		// validate simulated board.move undo for en-passant
		it('should be able to backout an en-passant', () => {
			let
				b = Board.create(),
				r = null;

			b.move(b.getSquare('e', 2), b.getSquare('e', 4));
			b.move(b.getSquare('e', 7), b.getSquare('e', 6));
			b.move(b.getSquare('e', 4), b.getSquare('e', 5));
			b.move(b.getSquare('f', 7), b.getSquare('f', 5));

			r = b.move(b.getSquare('e', 5), b.getSquare('f', 6), true);

			assert.strictEqual(b.getSquare('f', 5).piece, null);

			r.undo();

			assert.ok(b.getSquare('f', 5).piece !== null);
			assert.strictEqual(b.getSquare('f', 5).piece.type, PieceType.Pawn);
		});

		// validate board.move for castle and proper swap with rook
		it('should support a proper castle to the right from rank 8 ', () => {
			let b = Board.create();

			b.getSquare('f', 8).piece = null;
			b.getSquare('g', 8).piece = null;

			b.move(b.getSquare('e', 8), b.getSquare('g', 8));

			assert.ok(b.getSquare('f', 8).piece !== null);
			assert.ok(b.getSquare('h', 8).piece === null);
			assert.strictEqual(b.getSquare('f', 8).piece.type, PieceType.Rook);
		});

		// validate board.move for castle and proper swap with rook
		it('should support a proper castle to the left from rank 1', () => {
			let b = Board.create();

			b.getSquare('b', 1).piece = null;
			b.getSquare('c', 1).piece = null;
			b.getSquare('d', 1).piece = null;

			b.move(b.getSquare('e', 1), b.getSquare('c', 1));

			assert.ok(b.getSquare('d', 1).piece !== null);
			assert.ok(b.getSquare('a', 1).piece === null);
			assert.strictEqual(b.getSquare('d', 1).piece.type, PieceType.Rook);
		});

		// validate simulated board.move undo for castle
		it('should properly undo a castle to the right during simulation', () => {
			let
				b = Board.create(),
				r = null;

			b.getSquare('f', 8).piece = null;
			b.getSquare('g', 8).piece = null;

			r = b.move(b.getSquare('e', 8), b.getSquare('g', 8), true);

			assert.ok(b.getSquare('f', 8).piece !== null);
			assert.ok(b.getSquare('h', 8).piece === null);
			assert.strictEqual(b.getSquare('f', 8).piece.type, PieceType.Rook);

			r.undo();

			assert.ok(b.getSquare('f', 8).piece === null);
			assert.ok(b.getSquare('h', 8).piece !== null);
			assert.strictEqual(b.getSquare('h', 8).piece.type, PieceType.Rook);
		});

		// validate simulated board.move undo for castle
		it('should properly undo a castle to the left during simulation', () => {
			let
				b = Board.create(),
				r = null;

			b.getSquare('b', 1).piece = null;
			b.getSquare('c', 1).piece = null;
			b.getSquare('d', 1).piece = null;

			r = b.move(b.getSquare('e', 1), b.getSquare('c', 1), true);

			assert.ok(b.getSquare('d', 1).piece !== null);
			assert.ok(b.getSquare('a', 1).piece === null);
			assert.strictEqual(b.getSquare('d', 1).piece.type, PieceType.Rook);

			r.undo();

			assert.ok(b.getSquare('d', 1).piece === null);
			assert.ok(b.getSquare('a', 1).piece !== null);
			assert.strictEqual(b.getSquare('a', 1).piece.type, PieceType.Rook);
		});

		// validate pawn capture works as expected
		it('should properly recognize a pawn capture', () => {
			let
				b = Board.create(),
				r = null;

			b.move('e2', 'e4');
			b.move('d7', 'd5');
			b.move('d2', 'd4');
			r = b.move('d5', 'e4');

			assert.strictEqual(b.getSquare('e4').piece.type, PieceType.Pawn);
			assert.strictEqual(b.getSquare('d4').piece.type, PieceType.Pawn);
			assert.ok(b.getSquare('d5').piece === null);
			assert.strictEqual(r.move.capturedPiece.type, PieceType.Pawn);
		});

		// test pawn simulate move piece and no pieces disappear
		it('should have a pawn disappear after undo', () => {
			let
				b = Board.create(),
				r = null;

			b.move('e2', 'e4');
			b.move('d7', 'd5');
			b.move('d2', 'd4');

			assert.strictEqual(b.getSquare('d4').piece.type, PieceType.Pawn);

			r = b.move('d5', 'e4', true);

			assert.ok(b.getSquare('d4').piece !== null, 'pawn disappears during the move');

			r.undo();

			assert.ok(b.getSquare('d4').piece !== null, 'pawn disappears during the undo');
		});

		it('should properly return notation when supplied', () => {
			let
				b = Board.create(),
				r = null;

			r = b.move('e2', 'e4', 'e4');

			assert.ok(r.move.algebraic === 'e4', 'notation properly noted');
		});

		it('should not return notation when omitted', () => {
			let
				b = Board.create(),
				r = null;

			r = b.move('e2', 'e4');

			assert.ok(typeof r.move.algebraic === 'undefined', 'notation improperly present');
		});
	});
});
