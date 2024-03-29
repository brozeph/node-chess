/* eslint no-magic-numbers:0 */
import { assert } from 'chai';
import { Board } from '../../src/board.js';
import { PieceType } from '../../src/piece.js';
import { PieceValidation } from '../../src/pieceValidation.js';

describe('PieceValidation', () => {
	function checkForSquare (f, r, s) {
		let i = 0;

		for (; i < s.length; i++) {
			if (s[i].file === f && s[i].rank === r) {
				return true;
			}
		}

		return false;
	}

	// ensure invalid piece error is returned
	it('should throw exception if validation is created for wrong piece', () => {
		let
			b = Board.create(),
			pv = PieceValidation.create(PieceType.Bishop, b);

		pv.start(b.getSquare('a', 2), (err) => {
			assert.ok(err);
			assert.strictEqual(err.message, 'piece is invalid');
		});

		pv.start(null, (err) => {
			assert.ok(err);
			assert.strictEqual(err.message, 'piece is invalid');
		});
	});

	// validate bishop validator
	it('should create bishop validation correctly', () => {
		let
			b = Board.create(),
			pv = PieceValidation.create(PieceType.Bishop, b);

		assert.strictEqual(pv.allowDiagonal, true);
		assert.strictEqual(pv.type, PieceType.Bishop);
		assert.strictEqual(pv.repeat, 8);
	});

	// check bishop validator moves
	it('should properly represent bishop moves when blocked', () => {
		let
			b = Board.create(),
			pv = PieceValidation.create(PieceType.Bishop, b);

		pv.start(b.getSquare('c', 1), (err, squares) => {
			assert.strictEqual(err, null);
			assert.strictEqual(squares.length, 0);
		});
	});

	// check bishop validator moves
	it('should properly represent white bishop moves when not blocked', () => {
		let
			b = Board.create(),
			pv = PieceValidation.create(PieceType.Bishop, b);

		b.move(b.getSquare('d', 2), b.getSquare('d', 3));
		b.move(b.getSquare('c', 1), b.getSquare('e', 3));

		pv.start(b.getSquare('e', 3), (err, squares) => {
			assert.strictEqual(err, null);
			assert.strictEqual(squares.length, 9);
			assert.strictEqual(checkForSquare('a', 7, squares), true, 'Ba7');
			assert.strictEqual(checkForSquare('h', 6, squares), true, 'Bh6');
			assert.strictEqual(checkForSquare('c', 1, squares), true, 'Bc1');
		});
	});

	// check bishop validator moves
	it('should properly represent black bishop moves when not blocked', () => {
		let
			b = Board.create(),
			pv = PieceValidation.create(PieceType.Bishop, b);

		b.move(b.getSquare('d', 7), b.getSquare('d', 6));
		b.move(b.getSquare('c', 8), b.getSquare('e', 6));

		pv.start(b.getSquare('e', 6), (err, squares) => {
			assert.strictEqual(err, null);
			assert.strictEqual(squares.length, 9);
			assert.strictEqual(checkForSquare('a', 2, squares), true, 'Ba2');
			assert.strictEqual(checkForSquare('h', 3, squares), true, 'Bh3');
			assert.strictEqual(checkForSquare('c', 8, squares), true, 'Bc8');
		});
	});

	// test king validation create
	it('should properly create king validation', () => {
		let
			b = Board.create(),
			pv = PieceValidation.create(PieceType.King, b);

		assert.strictEqual(pv.allowForward, true);
		assert.strictEqual(pv.allowBackward, true);
		assert.strictEqual(pv.allowHorizontal, true);
		assert.strictEqual(pv.allowDiagonal, true);
		assert.strictEqual(pv.type, PieceType.King);
		assert.strictEqual(pv.repeat, 1);
	});

	// test knight validation create
	it('should properly create knight validation', () => {
		let
			b = Board.create(),
			pv = PieceValidation.create(PieceType.Knight, b);

		assert.strictEqual(pv.type, PieceType.Knight);
		assert.strictEqual(pv.repeat, 1);
	});

	// test knight validation moves
	it('should properly represent white knight first moves', () => {
		let
			b = Board.create(),
			pv = PieceValidation.create(PieceType.Knight, b);

		pv.start(b.getSquare('b', 1), (err, squares) => {
			assert.strictEqual(err, null);
			assert.strictEqual(squares.length, 2);
			assert.strictEqual(checkForSquare('a', 3, squares), true, 'Na3');
			assert.strictEqual(checkForSquare('c', 3, squares), true, 'Nc3');
		});
	});

	// test knight validation moves
	it('should properly represent black knight first moves', () => {
		let
			b = Board.create(),
			pv = PieceValidation.create(PieceType.Knight, b);

		pv.start(b.getSquare('b', 8), (err, squares) => {
			assert.strictEqual(err, null);
			assert.strictEqual(squares.length, 2);
			assert.strictEqual(checkForSquare('a', 6, squares), true, 'Na3');
			assert.strictEqual(checkForSquare('c', 6, squares), true, 'Nc3');
		});
	});

	// test knight validation moves
	it('should properly represent white knight second moves', () => {
		let
			b = Board.create(),
			pv = PieceValidation.create(PieceType.Knight, b);

		b.move(b.getSquare('b', 1), b.getSquare('c', 3));

		pv.start(b.getSquare('c', 3), (err, squares) => {
			assert.strictEqual(err, null);
			assert.strictEqual(squares.length, 5);
			assert.strictEqual(checkForSquare('b', 1, squares), true, 'Nb1');
			assert.strictEqual(checkForSquare('a', 4, squares), true, 'Na4');
			assert.strictEqual(checkForSquare('b', 5, squares), true, 'Nb5');
			assert.strictEqual(checkForSquare('d', 5, squares), true, 'Nd5');
			assert.strictEqual(checkForSquare('e', 4, squares), true, 'Ne4');
		});
	});

	// test pawn validation create
	it('should properly create pawn validation', () => {
		let
			b = Board.create(),
			pv = PieceValidation.create(PieceType.Pawn, b);

		assert.strictEqual(pv.allowForward, true);
		assert.strictEqual(pv.type, PieceType.Pawn);
		assert.strictEqual(pv.repeat, 1);
	});

	// test pawn validation moves
	it('should properly represent white pawn first moves', () => {
		let
			b = Board.create(),
			pv = PieceValidation.create(PieceType.Pawn, b);

		pv.start(b.getSquare('a', 2), (err, squares) => {
			assert.strictEqual(err, null);
			assert.strictEqual(squares.length, 2);
			assert.strictEqual(squares[1].rank, 4);
		});
	});

	// test pawn validation moves
	it('should properly represent white pawn second move', () => {
		let
			b = Board.create(),
			pv = PieceValidation.create(PieceType.Pawn, b);

		b.move(b.getSquare('a', 2), b.getSquare('a', 3));

		pv.start(b.getSquare('a', 3), (err, squares) => {
			if (err) {
				throw err;
			}

			assert.strictEqual(squares.length, 1);
			assert.strictEqual(squares[0].rank, 4);
		});
	});

	// test pawn validation moves
	it('should properly represent black pawn first moves', () => {
		let
			b = Board.create(),
			pv = PieceValidation.create(PieceType.Pawn, b);

		pv.start(b.getSquare('a', 7), (err, squares) => {
			if (err) {
				throw err;
			}

			assert.strictEqual(squares.length, 2);
			assert.strictEqual(squares[1].rank, 5);
		});
	});

	// test pawn validation moves
	it('should properly represent black pawn second move', () => {
		let
			b = Board.create(),
			pv = PieceValidation.create(PieceType.Pawn, b);

		b.move(b.getSquare('a', 7), b.getSquare('a', 6));

		pv.start(b.getSquare('a', 6), (err, squares) => {
			if (err) {
				throw err;
			}

			assert.strictEqual(squares.length, 1);
			assert.strictEqual(squares[0].rank, 5);
		});
	});

	// test pawn validation moves while pawn is blocked
	it('should properly represent pawn moves when blocked', () => {
		let
			b = Board.create(),
			pv = PieceValidation.create(PieceType.Pawn, b);

		b.move(b.getSquare('e', 2), b.getSquare('e', 4));
		b.move(b.getSquare('e', 7), b.getSquare('e', 6));
		b.move(b.getSquare('e', 4), b.getSquare('e', 5));

		pv.start(b.getSquare('e', 5), (err, squares) => {
			if (err) {
				throw err;
			}

			assert.strictEqual(squares.length, 0);
		});
	});

	// verify en-passant
	it('should properly represent en-passant as available move', () => {
		let
			b = Board.create(),
			pv = PieceValidation.create(PieceType.Pawn, b);

		// turn 1
		b.move(b.getSquare('e', 2), b.getSquare('e', 4));
		b.move(b.getSquare('e', 7), b.getSquare('e', 6));

		// turn 2
		b.move(b.getSquare('e', 4), b.getSquare('e', 5));
		b.move(b.getSquare('f', 7), b.getSquare('f', 5));

		pv.start(b.getSquare('e', 5), (err, squares) => {
			if (err) {
				throw err;
			}

			assert.strictEqual(squares.length, 1);
			assert.strictEqual(squares[0].rank, 6);
			assert.strictEqual(squares[0].file, 'f');
		});
	});

	// verify en-passant (issue #3)
	it('should properly not allow en-passant as available move', () => {
		let
			b = Board.create(),
			pv = PieceValidation.create(PieceType.Pawn, b);

		// turn 1
		b.move(b.getSquare('e', 2), b.getSquare('e', 4));
		b.move(b.getSquare('e', 7), b.getSquare('e', 6));

		// turn 2
		b.move(b.getSquare('e', 4), b.getSquare('e', 5));
		b.move(b.getSquare('f', 7), b.getSquare('f', 5));

		// turn 3
		b.move(b.getSquare('a', 2), b.getSquare('a', 3));
		b.move(b.getSquare('a', 7), b.getSquare('a', 6));

		pv.start(b.getSquare('e', 5), (err, squares) => {
			if (err) {
				throw err;
			}

			assert.strictEqual(squares.length, 0);
		});
	});

	// verify pawn capture moves
	it('should properly allow pawn capture to the right moves', () => {
		let
			b = Board.create(),
			pv = PieceValidation.create(PieceType.Pawn, b);

		b.move(b.getSquare('e', 2), b.getSquare('e', 4));
		b.move(b.getSquare('f', 7), b.getSquare('f', 6));
		b.move(b.getSquare('e', 4), b.getSquare('e', 5));

		pv.start(b.getSquare('e', 5), (err, squares) => {
			if (err) {
				throw err;
			}

			assert.strictEqual(squares.length, 2);
			assert.strictEqual(squares[1].rank, 6);
			assert.strictEqual(squares[1].file, 'f');
		});
	});

	// verify pawn capture moves
	it('should properly allow pawn capture to the left moves', () => {
		let
			b = Board.create(),
			pv = PieceValidation.create(PieceType.Pawn, b);

		b.move(b.getSquare('e', 2), b.getSquare('e', 4));
		b.move(b.getSquare('d', 7), b.getSquare('d', 6));
		b.move(b.getSquare('e', 4), b.getSquare('e', 5));

		pv.start(b.getSquare('e', 5), (err, squares) => {
			if (err) {
				throw err;
			}

			assert.strictEqual(squares.length, 2);
			assert.strictEqual(squares[1].rank, 6);
			assert.strictEqual(squares[1].file, 'd');
		});
	});

	// test queen validation create
	it('should properly create queen validation', () => {
		let
			b = Board.create(),
			pv = PieceValidation.create(PieceType.Queen, b);

		assert.strictEqual(pv.allowForward, true);
		assert.strictEqual(pv.allowBackward, true);
		assert.strictEqual(pv.allowHorizontal, true);
		assert.strictEqual(pv.allowDiagonal, true);
		assert.strictEqual(pv.type, PieceType.Queen);
		assert.strictEqual(pv.repeat, 8);
	});

	// test queen validation moves
	it('should properly allow queen moves across ranks and files', () => {
		let
			b = Board.create(),
			pv = PieceValidation.create(PieceType.Queen, b);

		b.move(b.getSquare('e', 2), b.getSquare('e', 5));
		b.move(b.getSquare('d', 1), b.getSquare('f', 3));

		pv.start(b.getSquare('f', 3), (err, squares) => {
			if (err) {
				throw err;
			}

			assert.strictEqual(err, null);
			assert.strictEqual(squares.length, 19);
			assert.strictEqual(checkForSquare('f', 7, squares), true, 'Qf7');
			assert.strictEqual(checkForSquare('b', 7, squares), true, 'Qb7');
			assert.strictEqual(checkForSquare('h', 3, squares), true, 'Qh3');
		});
	});

	// test rook validation create
	it('should properly create rook validation', () => {
		let
			b = Board.create(),
			pv = PieceValidation.create(PieceType.Rook, b);

		assert.strictEqual(pv.allowForward, true);
		assert.strictEqual(pv.allowBackward, true);
		assert.strictEqual(pv.allowHorizontal, true);
		assert.strictEqual(pv.type, PieceType.Rook);
		assert.strictEqual(pv.repeat, 8);
	});

	// test rook validation moves
	it('should properly represent blocked white rook moves', () => {
		let
			b = Board.create(),
			pv = PieceValidation.create(PieceType.Rook, b);

		pv.start(b.getSquare('a', 1), (err, squares) => {
			if (err) {
				throw err;
			}

			assert.strictEqual(err, null);
			assert.strictEqual(squares.length, 0);
		});
	});

	// test rook validation moves
	it('should properly represent white rook moves when not blocked', () => {
		let
			b = Board.create(),
			pv = PieceValidation.create(PieceType.Rook, b);

		b.move(b.getSquare('a', 2), b.getSquare('a', 4));
		b.move(b.getSquare('a', 1), b.getSquare('a', 3));

		pv.start(b.getSquare('a', 3), (err, squares) => {
			if (err) {
				throw err;
			}

			assert.strictEqual(err, null);
			assert.strictEqual(squares.length, 9);

			let
				files = '',
				i = 0;

			for (; i < squares.length; i++) {
				files += squares[i].file;
			}

			assert.strictEqual(files, 'aabcdefgh');
		});
	});

	// test rook validation moves
	it('should properly represent black rook moves when not blocked', () => {
		let
			b = Board.create(),
			pv = PieceValidation.create(PieceType.Rook, b);

			b.move(b.getSquare('a', 7), b.getSquare('a', 5));
			b.move(b.getSquare('a', 8), b.getSquare('a', 6));

		pv.start(b.getSquare('a', 6), (err, squares) => {
			if (err) {
				throw err;
			}

			assert.strictEqual(err, null);
			assert.strictEqual(squares.length, 9);

			let
				files = '',
				i = 0;

			for (; i < squares.length; i++) {
				files += squares[i].file;
			}

			assert.strictEqual(files, 'aabcdefgh');
		});
	});

	// test rook validation moves including capture
	it('should properly represent rook moves including captures', () => {
		let
			b = Board.create(),
			pv = PieceValidation.create(PieceType.Rook, b);

		// kill the white pawn in-front of the rook
		b.getSquare('a', 2).piece = null;

		pv.start(b.getSquare('a', 1), (err, squares) => {
			if (err) {
				throw err;
			}

			assert.strictEqual(err, null);
			assert.strictEqual(squares.length, 6);

			let
				i = 0,
				sumRanks = 0;

			for (; i < squares.length; i++) {
				sumRanks += squares[i].rank;
			}

			assert.strictEqual(sumRanks, 2+3+4+5+6+7);
		});
	});
});
