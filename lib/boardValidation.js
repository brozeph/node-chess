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

var piece = require('./piece.js'),
	board = require('./board.js'),
	pieceValidation = require('./pieceValidation.js');

// base ctor
var BoardValidation = function(g) {
	this.board = g ? g.board : null;
	this.game = g;
};

// methods
// add castle moves to king's valid squares if appropriate
BoardValidation.prototype.evaluateCastle = function(validMoves) {
	var getValidSquares = function(sq) {
			var i = 0;
			
			for (; i < validMoves.length; i++) {
				if (validMoves[i].src === sq) {
					return validMoves[i].squares;	
				}
			}
		},
		isAttacked = false,
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
			'h' : this.board.getSquare('h', rank)};

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
			if (!squares.g.piece &&
				!squares.f.piece) {

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
	var i = 0,
		isCheck = false,
		n = 0,
		r = null,
		squares = [],
		filteredMoves = [];

	for (; i < moves.length; i++) {
		squares = [];

		for (n = 0; n < moves[i].squares.length; n++) {
			r = this.board.move(moves[i].src, moves[i].squares[n], true);

			// check if king is attacked
			if (moves[i].squares[n].piece.type !== piece.PieceType.King) {
				isCheck = this.isSquareAttacked(kingSquare);
			} else {
				isCheck = this.isSquareAttacked(moves[i].squares[n]);
			}

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
BoardValidation.prototype.isSquareAttacked = function(sq, debug) {
	if (!sq || !sq.piece) {
		return false;
	}

	var findAttackers = function(b, n) {
			var currentSquare = b.getNeighborSquare(sq, n);

			while (currentSquare) {
				var context = {
						attacked : currentSquare.piece && currentSquare.piece.side !== sq.piece.side,
						blocked : currentSquare.piece && currentSquare.piece.side === sq.piece.side,
						piece : currentSquare.piece };

				if (context.attacked) {
					// verify that the square is actually attacked
					pieceValidation
						.create(context.piece.type, b)
						.start(currentSquare, setAttacked(context));
					return context.attacked;
				} else if (context.blocked) {
					return false;
				} else {
					currentSquare = b.getNeighborSquare(currentSquare, n);
				}
			}

			return false;
		}, 
		setAttacked = function (c) {
			return function(err, squares) {
				var i = 0;
				for (; i < squares.length; i++) {
					if (squares[i] === sq) {
						c.attacked = true;
						return;
					}
				}

				c.attacked = false;
			};
		};

	return findAttackers(this.board, board.NeighborType.Above) ||
		findAttackers(this.board, board.NeighborType.AboveRight) ||
		findAttackers(this.board, board.NeighborType.Right) ||
		findAttackers(this.board, board.NeighborType.BelowRight) ||
		findAttackers(this.board, board.NeighborType.Below) ||
		findAttackers(this.board, board.NeighborType.BelowLeft) ||
		findAttackers(this.board, board.NeighborType.Left) ||
		findAttackers(this.board, board.NeighborType.AboveLeft);
};

// begin evaluation of the valid moves for an entire board
BoardValidation.prototype.start = function(callback) {
	var err = null,
		i = 0,
		kingSquare = null,
		setValidMoves = function(v, sq) {
			return function(err, squares) {
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

		for (; i < squares.length; i++) {
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
	create : function(g) {
		return new BoardValidation(g);
	}
};