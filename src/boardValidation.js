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
import { PieceType, SideType } from './piece.js';
import { NeighborType } from './board.js';
import { PieceValidation } from './pieceValidation.js';

export class BoardValidation {
	constructor (game) {
		this.board = game ? game.board : null;
		this.game = game;
	}

	static create (game) {
		return new BoardValidation(game);
	}

	evaluateCastle (validMoves) {
		let
			getValidSquares = (sq) => {
				let i = 0;

				for (i = 0; i < validMoves.length; i++) {
					if (validMoves[i].src === sq) {
						return validMoves[i].squares;
					}
				}
			},
			interimMove = null,
			// eslint-disable-next-line no-magic-numbers
			rank = this.game.getCurrentSide() === SideType.White ? 1 : 8,
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
				squares.e.piece.type === PieceType.King &&
				squares.e.piece.moveCount === 0 &&
				!this.isSquareAttacked(squares.e)) {

			// is left rook eligible
			if (squares.a.piece &&
					squares.a.piece.type === PieceType.Rook &&
					squares.a.piece.moveCount === 0) {

				// are the squares between king and rook clear
				if (!squares.b.piece &&
						!squares.c.piece &&
						!squares.d.piece) {

					// when king moves through squares between, is it in check
					interimMove = this.board.move(squares.e, squares.d, true);
					if (!this.isSquareAttacked(squares.d)) {
						interimMove.undo();
						interimMove = this.board.move(squares.e, squares.c, true);

						if (!this.isSquareAttacked(squares.c)) {
							getValidSquares(squares.e).push(squares.c);
						}
					}
					interimMove.undo();
				}
			}

			// is right rook eligible
			if (squares.h.piece &&
					squares.h.piece.type === PieceType.Rook &&
					squares.h.piece.moveCount === 0) {

				// are the squares between king and rook clear
				if (!squares.g.piece && !squares.f.piece) {
					// when king moves through squares between, is it in check
					interimMove = this.board.move(squares.e, squares.f, true);
					if (!this.isSquareAttacked(squares.f)) {
						interimMove.undo();
						interimMove = this.board.move(squares.e, squares.g, true);

						if (!this.isSquareAttacked(squares.g)) {
							getValidSquares(squares.e).push(squares.g);
						}
					}
					interimMove.undo();
				}
			}
		}
	}

	filterKingAttack (kingSquare, moves) {
		let
			filteredMoves = [],
			i = 0,
			isCheck = false,
			n = 0,
			r = null,
			squares = [];

		for (i = 0; i < moves.length; i++) {
			squares = [];

			for (n = 0; n < moves[i].squares.length; n++) {
				// simulate move on the board
				r = this.board.move(moves[i].src, moves[i].squares[n], true);

				// check if king is attacked
				if (moves[i].squares[n].piece.type !== PieceType.King) {
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
					squares,
					src : moves[i].src
				});
			}
		}

		return filteredMoves;
	}

	findAttackers (sq) {
		if (!sq || !sq.piece) {
			return {
				attacked : false,
				blocked : false
			};
		}

		let
			/* eslint no-invalid-this: 0 */
			isAttacked = (b, n) => {
				let
					context = {},
					currentSquare = b.getNeighborSquare(sq, n);

				while (currentSquare) {
					context = {
						attacked : currentSquare.piece && currentSquare.piece.side !== sq.piece.side,
						blocked : currentSquare.piece && currentSquare.piece.side === sq.piece.side,
						piece : currentSquare.piece,
						square : currentSquare
					};

					if (context.attacked) {
						// verify that the square is actually attacked
						PieceValidation
							.create(context.piece.type, b)
							.start(currentSquare, setAttacked(context));
						currentSquare = null;
					} else if (context.blocked) {
						currentSquare = null;
					} else {
						currentSquare = b.getNeighborSquare(currentSquare, n);
					}
				}

				return context;
			},
			isAttackedByKnight = (b, n) => {
				let
					context,
					currentSquare = b.getNeighborSquare(sq, n);

				context = {
					attacked : false,
					blocked : false,
					piece : currentSquare ? currentSquare.piece : currentSquare,
					square : currentSquare
				};

				if (currentSquare &&
					currentSquare.piece &&
					currentSquare.piece.type === PieceType.Knight) {
					PieceValidation
						.create(PieceType.Knight, b)
						.start(currentSquare, setAttacked(context));
				}

				return context;
			},
			self = this,
			setAttacked = (c) => {
				return (err, squares) => {
					if (!err) {
						let i = 0;
						for (i = 0; i < squares.length; i++) {
							if (squares[i] === sq) {
								c.attacked = true;
								return;
							}
						}
					}

					c.attacked = false;
				};
			};

		return [
			isAttacked(self.board, NeighborType.Above),
			isAttacked(self.board, NeighborType.AboveRight),
			isAttacked(self.board, NeighborType.Right),
			isAttacked(self.board, NeighborType.BelowRight),
			isAttacked(self.board, NeighborType.Below),
			isAttacked(self.board, NeighborType.BelowLeft),
			isAttacked(self.board, NeighborType.Left),
			isAttacked(self.board, NeighborType.AboveLeft),
			// fix for issue #4
			isAttackedByKnight(self.board, NeighborType.KnightAboveRight),
			isAttackedByKnight(self.board, NeighborType.KnightRightAbove),
			isAttackedByKnight(self.board, NeighborType.KnightBelowRight),
			isAttackedByKnight(self.board, NeighborType.KnightRightBelow),
			isAttackedByKnight(self.board, NeighborType.KnightBelowLeft),
			isAttackedByKnight(self.board, NeighborType.KnightLeftBelow),
			isAttackedByKnight(self.board, NeighborType.KnightAboveLeft),
			isAttackedByKnight(self.board, NeighborType.KnightLeftAbove)
		].filter((result) => result.attacked);
	}

	isSquareAttacked (sq) {
		return this.findAttackers(sq).length !== 0;
	}

	start (callback) {
		// ensure callback is set
		callback = callback || ((err, validMoves) => new Promise((resolve, reject) => {
			if (err) {
				return reject(err);
			}

			return resolve(validMoves);
		}));

		let
			i = 0,
			kingSquare = null,
			setValidMoves = (v, sq) => {
				return (err, squares) => {
					if (err) {
						return callback(err);
					}

					if (squares && squares.length > 0) {
						v.push({
							squares,
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
				if (squares[i].piece.type === PieceType.King) {
					kingSquare = squares[i];
				}

				if (squares[i] && squares[i].piece) {
					PieceValidation
						.create(squares[i].piece.type, this.board)
						.start(squares[i], setValidMoves(validMoves, squares[i]));
				}
			}

			// perform king castle validation
			this.evaluateCastle(validMoves);

			// make sure moves only contain escape & non-check options
			validMoves = this.filterKingAttack(kingSquare, validMoves);

			// find any pieces attacking the king
			this.findAttackers(kingSquare).forEach((attacker) => {
				if (!validMoves.length) {
					this.game.emit(
						'checkmate', {
							attackingSquare : attacker.square,
							kingSquare
						});

					return;
				}

				this.game.emit(
					'check', {
						attackingSquare : attacker.square,
						kingSquare
					});
			});
		} else {
			return callback(new Error('board is invalid'));
		}

		return callback(null, validMoves);
	}
}

export default { BoardValidation };