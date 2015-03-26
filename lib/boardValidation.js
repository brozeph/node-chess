/**
	BoardValidation determines viable move options for all pieces
	given the current state of the board. If it's the White sides turn
	to attack, only White piece move options are evaluated (and visa versa).

	BoardValidation is intended to be the 2nd phase of move
	validation that is capable of taking into account factors across pieces
	on the board (and not just the pieces themselves). For example, King
	castle eligibility is determined based on whether or not both the candidate
	King and Rook pieces have not moved and whether or not the path of travel
	for the King would result in the King being placed in check at any
	point during the travel. Individual Piece validation wouldn't be sufficient
	to determine whether or not this move is possible.

	Additionally, isSquareAttacked exists on the BoardValidation object. While
	this method could have easily existed within the PieceValidation object
	I've kept it in BoardValidation so that PieceValidation remains truly
	agnostic of the other pieces on the same board.

	Due to how BoardValidation actually functions, the client only needs to
	instantiate a BoardValidation for the Game and call the start method
	in order to evaluate every Piece's valid move options. There is no need
	to call PieceValidation (and doing so wouldn't give an accurate picture
	of what is possible anyway).
*/

var
	piece = require('./piece.js'),
	board = require('./board.js'),
	pieceValidation = require('./pieceValidation.js');

// base ctor
var BoardValidation = function (g) {
	'use strict';

	this.board = g ? g.board : null;
	this.game = g;
};

// methods
// add castle moves to king's valid squares if appropriate
BoardValidation.prototype.evaluateCastle = function (validMoves) {
	'use strict';

	var
		getValidSquares = function (sq) {
			var i = 0;

			for (i = 0; i < validMoves.length; i++) {
				if (validMoves[i].src === sq) {
					return validMoves[i].squares;
				}
			}
		},
		r = null,
		rank = this.game.getCurrentSide() === piece.SideType.White ? 1 : 8,
		squares = {
			'a' : this.board.getSquare('a', rank),
			'b' : this.board.getSquare('b', rank),
			'c' : this.board.getSquare('c', rank),
			'd' : this.board.getSquare('d', rank),
			'e' : this.board.getSquare('e', rank),
			'f' : this.board.getSquare('f', rank),
			'g' : this.board.getSquare('g', rank),
			'h' : this.board.getSquare('h', rank)
		};

	// is king eligible
	if (squares.e.piece &&
			squares.e.piece.type === piece.PieceType.King &&
			squares.e.piece.moveCount === 0 &&
			!this.isSquareAttacked(squares.e)) {

		// is left rook eligible
		if (squares.a.piece &&
				squares.a.piece.type === piece.PieceType.Rook &&
				squares.a.piece.moveCount === 0) {

			// are the squares between king and rook clear
			if (!squares.b.piece &&
					!squares.c.piece &&
					!squares.d.piece) {

				// when king moves through squares between, is it in check
				r = this.board.move(squares.e, squares.d, true);
				if (!this.isSquareAttacked(squares.d)) {
					r.undo();
					r = this.board.move(squares.e, squares.c, true);

					if (!this.isSquareAttacked(squares.c)) {
						getValidSquares(squares.e).push(squares.c);
					}
				}
				r.undo();
			}
		}

		// is right rook eligible
		if (squares.h.piece &&
				squares.h.piece.type === piece.PieceType.Rook &&
				squares.h.piece.moveCount === 0) {

			// are the squares between king and rook clear
			if (!squares.g.piece && !squares.f.piece) {
				// when king moves through squares between, is it in check
				r = this.board.move(squares.e, squares.f, true);
				if (!this.isSquareAttacked(squares.f)) {
					r.undo();
					r = this.board.move(squares.e, squares.g, true);

					if (!this.isSquareAttacked(squares.g)) {
						getValidSquares(squares.e).push(squares.g);
					}
				}
				r.undo();
			}
		}
	}
};

// filter out any moves that would result in the king being attacked
BoardValidation.prototype.filterKingAttack = function (kingSquare, moves) {
	'use strict';

	var
		i = 0,
		isCheck = false,
		n = 0,
		r = null,
		squares = [],
		filteredMoves = [];

	for (i = 0; i < moves.length; i++) {
		squares = [];

		for (n = 0; n < moves[i].squares.length; n++) {
			// simulate move on the board
			r = this.board.move(moves[i].src, moves[i].squares[n], true);

			// check if king is attacked
			if (moves[i].squares[n].piece.type !== piece.PieceType.King) {
				isCheck = this.isSquareAttacked(kingSquare);
			} else {
				isCheck = this.isSquareAttacked(moves[i].squares[n]);
			}

			// reverse the move
			r.undo();

			if (!isCheck) {
				squares.push(moves[i].squares[n]);
			}
		}

		if (squares && squares.length > 0) {
			filteredMoves.push({
				src : moves[i].src,
				squares : squares
			});
		}
	}

	return filteredMoves;
};

// determine if the specified square is under attack
BoardValidation.prototype.isSquareAttacked = function (sq) {
	'use strict';

	if (!sq || !sq.piece) {
		return false;
	}

	var
		setAttacked = function (c) {
			return function (err, squares) {
				if (!err) {
					var i = 0;
					for (i = 0; i < squares.length; i++) {
						if (squares[i] === sq) {
							c.attacked = true;
							return;
						}
					}
				}

				c.attacked = false;
			};
		},
		isAttacked = function (b, n) {
			var currentSquare = b.getNeighborSquare(sq, n),
				context = {};

			while (currentSquare) {
				context = {
					attacked : currentSquare.piece && currentSquare.piece.side !== sq.piece.side,
					blocked : currentSquare.piece && currentSquare.piece.side === sq.piece.side,
					piece : currentSquare.piece
				};

				if (context.attacked) {
					// verify that the square is actually attacked
					pieceValidation
						.create(context.piece.type, b)
						.start(currentSquare, setAttacked(context));
					currentSquare = null;
				} else if (context.blocked) {
					currentSquare = null;
				} else {
					currentSquare = b.getNeighborSquare(currentSquare, n);
				}
			}

			return context.blocked ? false : context.attacked || false;
		},
		isAttackedByKnight = function (b, n) {
			var currentSquare = b.getNeighborSquare(sq, n),
				context = { attacked : false };

			if (currentSquare &&
				currentSquare.piece &&
				currentSquare.piece.type === piece.PieceType.Knight) {
				pieceValidation
					.create(piece.PieceType.Knight, b)
					.start(currentSquare, setAttacked(context));
			}

			return context.attacked;
		};

	return (
		isAttacked(this.board, board.NeighborType.Above) ||
		isAttacked(this.board, board.NeighborType.AboveRight) ||
		isAttacked(this.board, board.NeighborType.Right) ||
		isAttacked(this.board, board.NeighborType.BelowRight) ||
		isAttacked(this.board, board.NeighborType.Below) ||
		isAttacked(this.board, board.NeighborType.BelowLeft) ||
		isAttacked(this.board, board.NeighborType.Left) ||
		isAttacked(this.board, board.NeighborType.AboveLeft) ||

		// fix for issue #4
		isAttackedByKnight(this.board, board.NeighborType.KnightAboveRight) ||
		isAttackedByKnight(this.board, board.NeighborType.KnightRightAbove) ||
		isAttackedByKnight(this.board, board.NeighborType.KnightBelowRight) ||
		isAttackedByKnight(this.board, board.NeighborType.KnightRightBelow) ||
		isAttackedByKnight(this.board, board.NeighborType.KnightBelowLeft) ||
		isAttackedByKnight(this.board, board.NeighborType.KnightLeftBelow) ||
		isAttackedByKnight(this.board, board.NeighborType.KnightAboveLeft) ||
		isAttackedByKnight(this.board, board.NeighborType.KnightLeftAbove));
};

// begin evaluation of the valid moves for an entire board
BoardValidation.prototype.start = function (callback) {
	'use strict';

	var err = null,
		i = 0,
		kingSquare = null,
		setValidMoves = function (v, sq) {
			return function (err, squares) {
				if (squares && squares.length > 0) {
					v.push({
						squares : squares,
						src : sq
					});
				}
			};
		},
		squares = [],
		validMoves = [];

	if (this.board) {
		// get squares with pieces for which to evaluate move options
		squares = this.board.getSquares(this.game.getCurrentSide());

		for (i = 0; i < squares.length; i++) {
			// set king to refer to later
			if (squares[i].piece.type === piece.PieceType.King) {
				kingSquare = squares[i];
			}

			if (squares[i]) {
				pieceValidation
					.create(squares[i].piece.type, this.board)
					.start(squares[i], setValidMoves(validMoves, squares[i]));
			}
		}

		// perform king castle validation
		this.evaluateCastle(validMoves);

		// make sure moves only contain escape & non-check options
		validMoves = this.filterKingAttack(kingSquare, validMoves);
	} else {
		err = 'board is invalid';
	}

	if (callback) {
		callback(err, validMoves);
	}
};

// exports
module.exports = {
	create : function (g) {
		'use strict';

		return new BoardValidation(g);
	}
};
