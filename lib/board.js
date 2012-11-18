/**
	The Board is the representation of the current position of the pieces on
	the squares it contains.
*/

var EventEmitter = require('events').EventEmitter,
	sys = require('util'),
	piece = require('./piece.js'),
	Square = require('./square.js');

// types
var NeighborType = {
	Above : { offset : 8 },
	AboveLeft : { offset : 7 },
	AboveRight : { offset : 9 },
	Below : { offset : -8 },
	BelowLeft : { offset : -9 },
	BelowRight : { offset : -7 },
	Left : { offset : -1 },
	Right : { offset : 1 }
};

// ctor
var Board = function (squares) {
	'use strict';

	this.squares = squares;
};

// enable events
sys.inherits(Board, EventEmitter);

// methods
Board.prototype.getNeighborSquare = function (sq, n) {
	'use strict';

	if (sq && n) {
		// validate boundaries of board
		if (sq.file === 'a' && (n === NeighborType.AboveLeft ||
				n === NeighborType.BelowLeft ||
				n === NeighborType.Left)) {
			return null;
		}

		if (sq.file === 'h' && (n === NeighborType.AboveRight ||
				n === NeighborType.BelowRight ||
				n === NeighborType.Right)) {
			return null;
		}

		if (sq.rank === 1 && (n === NeighborType.Below ||
				n === NeighborType.BelowLeft ||
				n === NeighborType.BelowRight)) {
			return null;
		}

		if (sq.rank === 8 && (n === NeighborType.Above ||
				n === NeighborType.AboveLeft ||
				n === NeighborType.AboveRight)) {
			return null;
		}

		// validate file
		var fIndex = 'abcdefgh'.indexOf(sq.file),
			i = 0;

		if (fIndex !== -1 && sq.rank > 0 && sq.rank < 9) {
			// find the index
			i = 8 * (sq.rank - 1) + fIndex + n.offset;
			if (this.squares && this.squares.length > i && i > -1) {
				return this.squares[i];
			}
		}
	}

	return null;
};

Board.prototype.getSquare = function (f, r) {
	'use strict';

	// check for shorthand
	if (typeof f === 'string' && f.length === 2 && !r) {
		r = parseInt(f.charAt(1), 10);
		f = f.charAt(0);
	}

	// validate file
	var fIndex = 'abcdefgh'.indexOf(f),
		i = 0;

	if (fIndex !== -1 && r > 0 && r < 9) {
		// Find the index
		i = 8 * (r - 1) + fIndex;
		if (this.squares && this.squares.length > i) {
			return this.squares[i];
		}
	}

	return null;
};

Board.prototype.getSquares = function (side) {
	'use strict';

	var list = [],
		i = 0;

	for (i = 0; i < this.squares.length; i++) {
		if (this.squares[i].piece &&
				this.squares[i].piece.side === side) {
			list.push(this.squares[i]);
		}
	}

	return list;
};

Board.prototype.move = function (src, dest, simulate) {
	'use strict';

	if (typeof src === 'string' &&
			src.length === 2) {
		src = this.getSquare(src);
	}

	if (typeof dest === 'string' &&
			dest.length === 2) {
		dest = this.getSquare(dest);
	}

	if (src && src.file && src.rank &&
			dest && dest.file && dest.rank) {
		var move = {
				capturedPiece : dest.piece,
				castle : false,
				enPassant : false,
				postSquare : dest,
				prevSquare : src
			},
			p = src.piece,
			sq = null,
			undo = function (b, m, s) {
				return function () {
					m.prevSquare.piece = m.postSquare.piece;
					m.postSquare.piece = m.capturedPiece;

					if (!m.enPassant) {
						m.postSquare.piece = m.capturedPiece;
					} else {
						b.getSquare(m.postSquare.file,
							m.prevSquare.rank).piece = m.capturedPiece;
					}

					if (m.castle) {
						sq = b.getSquare(
							move.postSquare.file === 'g' ? 'f' : 'd',
							move.postSquare.rank
						);
						b.getSquare(
							move.postSquare.file === 'g' ? 'h' : 'a',
							move.postSquare.rank
						).piece = sq.piece;
						sq.piece = null;
					}
				};
			};

		dest.piece = p;
		move.castle = p.type === piece.PieceType.King &&
			p.moveCount === 0 &&
			(move.postSquare.file === 'g' || move.postSquare.file === 'c');
		move.enPassant = p.type === piece.PieceType.Pawn &&
			move.capturedPiece === null &&
			move.postSquare.file !== move.prevSquare.file;
		move.prevSquare.piece = null;

		// check for en-passant
		if (move.enPassant) {
			sq = this.getSquare(move.postSquare.file, move.prevSquare.rank);
			move.capturedPiece = sq.piece;
			sq.piece = null;
		}

		// check for castle
		if (move.castle) {
			sq = this.getSquare(
				move.postSquare.file === 'g' ? 'h' : 'a',
				move.postSquare.rank
			);

			if (sq.piece === null) {
				move.castle = false;
			} else {
				this.getSquare(
					move.postSquare.file === 'g' ? 'f' : 'd',
					move.postSquare.rank
				).piece = sq.piece;
				sq.piece = null;
			}
		}

		if (!simulate) {
			p.moveCount++;
			this.emit('move', move);
		}

		return {
			move : move,
			undo : undo(this, move, simulate)
		};
	}
};

// exports
module.exports = {
	// methods
	create : function () {
		'use strict';

		var b = new Board([]),
			i = 0,
			f = 0,
			r = 0,
			sq = null;

		for (i = 0; i < 64; i++) {
			f = Math.floor(i % 8);
			r = Math.floor(i / 8) + 1;
			sq = Square.create('abcdefgh'[f], r);

			b.squares.push(sq);

			if (r === 1 || r === 8) { // Named pieces
				if (f === 0 || f === 7) { // Rookage
					sq.piece = piece.createRook(
						r === 1 ? piece.SideType.White : piece.SideType.Black
					);
				} else if (f === 1 || f === 6) { // Knights
					sq.piece = piece.createKnight(
						r === 1 ? piece.SideType.White : piece.SideType.Black
					);
				} else if (f === 2 || f === 5) { // Bish's
					sq.piece = piece.createBishop(
						r === 1 ? piece.SideType.White : piece.SideType.Black
					);
				} else if (f === 3) {
					sq.piece = piece.createQueen(
						r === 1 ? piece.SideType.White : piece.SideType.Black
					);
				} else {
					sq.piece = piece.createKing(
						r === 1 ? piece.SideType.White : piece.SideType.Black
					);
				}
			} else if (r === 2 || r === 7) { // Pawns
				sq.piece = piece.createPawn(
					r === 2 ? piece.SideType.White : piece.SideType.Black
				);
			}
		}

		return b;
	},

	// enums
	NeighborType : NeighborType
};