/**
	The general idea behind PieceValidation is to examine an individual piece
	and determine (with the information available from about that single piece)
	what move options are available for that piece.

	The PieceValidation doesn't alter any properties of the piece, the board
	or any squares. Additionally, the PieceValidation is suitable for 1 phase of
	the evaluation of viable move options for a piece... the BoardValidation
	component handles the overall evaluation of what moves are possible for the
	board in its current state.
*/
import { PieceType, SideType } from './piece.js';
import { NeighborType } from './board.js';

export class PieceValidation {
	constructor (board) {
		this.allowBackward = false;
		this.allowDiagonal = false;
		this.allowForward = false;
		this.allowHorizontal = false;
		this.board = board;
		this.type = null;
		this.repeat = 0;
	}

	applySpecialValidation () {
		// do nothing...
		// overridden in the concrete validation classes
		// where special logic is required
	}

	static create (piece, board) {
		switch (piece) {
			case PieceType.Bishop:
				return new BishopValidation(board);
			case PieceType.King:
				return new KingValidation(board);
			case PieceType.Knight:
				return new KnightValidation(board);
			case PieceType.Pawn:
				return new PawnValidation(board);
			case PieceType.Queen:
				return new QueenValidation(board);
			case PieceType.Rook:
				return new RookValidation(board);
			default:
				return null;
		}
	}

	start (src, callback) {
		// ensure callback is set
		callback = callback || ((err, destinationSquares) => new Promise((resolve, reject) => {
			if (err) {
				return reject(err);
			}

			return resolve(destinationSquares);
		}));

		let opt = {
			destSquares : [],
			origin : src,
			piece : src ? src.piece : null
		};

		const findMoveOptions = function (b, r, n) {
			let
				block = false,
				capture = false,
				currentSquare = b.getNeighborSquare(opt.origin, n),
				i = 0;

			while (currentSquare && i < r) {
				block = currentSquare.piece !== null &&
					(opt.piece.type === PieceType.Pawn ||
						currentSquare.piece.side === opt.piece.side);
				capture = (currentSquare.piece && !block);

				if (!block) {
					opt.destSquares.push(currentSquare);
				}

				if (capture || block) {
					currentSquare = null;
				} else {
					currentSquare = b.getNeighborSquare(currentSquare, n);
					i++;
				}
			}
		};

		if (!opt.piece || opt.piece.type !== this.type) {
			return callback(new Error('piece is invalid'));
		}

		if (this.board && opt.origin) {
			// forward squares
			if (this.allowForward) {
				findMoveOptions(this.board, this.repeat,
					opt.piece.side === SideType.White ?
							NeighborType.Above :
							NeighborType.Below);
			}

			// backward squares
			if (this.allowBackward) {
				findMoveOptions(this.board, this.repeat,
					opt.piece.side === SideType.White ?
							NeighborType.Below :
							NeighborType.Above);
			}

			// horizontal squares
			if (this.allowHorizontal) {
				findMoveOptions(this.board, this.repeat, NeighborType.Left);
				findMoveOptions(this.board, this.repeat, NeighborType.Right);
			}

			// diagonal squares
			if (this.allowDiagonal) {
				findMoveOptions(this.board, this.repeat, NeighborType.AboveLeft);
				findMoveOptions(this.board, this.repeat, NeighborType.BelowRight);
				findMoveOptions(this.board, this.repeat, NeighborType.BelowLeft);
				findMoveOptions(this.board, this.repeat, NeighborType.AboveRight);
			}

			// apply additional validation logic
			this.applySpecialValidation(opt);

			// callback
			return callback(null, opt.destSquares);
		}

		return callback(new Error('board is invalid'));
	}
}

export class BishopValidation extends PieceValidation {
	constructor (board) {
		super(board);

		// base validation properties
		this.allowDiagonal = true;
		this.type = PieceType.Bishop;
		this.repeat = 8;
	}
}

export class KingValidation extends PieceValidation {
	constructor (board) {
		super(board);

		// base validation properties
		this.allowBackward = true;
		this.allowDiagonal = true;
		this.allowForward = true;
		this.allowHorizontal = true;
		this.type = PieceType.King;
		this.repeat = 1;
	}

	applySpecialValidation () {
		// check for castle?
	}
}

export class KnightValidation extends PieceValidation {
	constructor (board) {
		super(board);

		// base validation properties
		this.type = PieceType.Knight;
		this.repeat = 1;
	}

	applySpecialValidation (opt) {
		// add knight move options
		let
			aboveLeft = this.board.getNeighborSquare(
				opt.origin,
				NeighborType.AboveLeft),
			aboveRight = this.board.getNeighborSquare(
				opt.origin,
				NeighborType.AboveRight),
			belowLeft = this.board.getNeighborSquare(
				opt.origin,
				NeighborType.BelowLeft),
			belowRight = this.board.getNeighborSquare(
				opt.origin,
				NeighborType.BelowRight),
			i = 0,
			p = null,
			squares = [];

		if (aboveLeft) {
			squares.push(this.board.getNeighborSquare(
				aboveLeft,
				NeighborType.Above));

			squares.push(this.board.getNeighborSquare(
				aboveLeft,
				NeighborType.Left));
		}

		if (aboveRight) {
			squares.push(this.board.getNeighborSquare(
				aboveRight,
				NeighborType.Above));

			squares.push(this.board.getNeighborSquare(
				aboveRight,
				NeighborType.Right));
		}

		if (belowLeft) {
			squares.push(this.board.getNeighborSquare(
				belowLeft,
				NeighborType.Below));

			squares.push(this.board.getNeighborSquare(
				belowLeft,
				NeighborType.Left));
		}

		if (belowRight) {
			squares.push(this.board.getNeighborSquare(
				belowRight,
				NeighborType.Below));

			squares.push(this.board.getNeighborSquare(
				belowRight,
				NeighborType.Right));
		}

		for (i = 0; i < squares.length; i++) {
			if (squares[i]) {
				// check for enemy piece on square
				p = squares[i] ? squares[i].piece : null;
				if (!p || p.side !== opt.piece.side) {
					opt.destSquares.push(squares[i]);
				}
			}
		}
	}
}

export class PawnValidation extends PieceValidation {
	constructor (board) {
		super(board);

		// base validation properties
		this.allowForward = true;
		this.type = PieceType.Pawn;
		this.repeat = 1;
	}

	/* eslint no-magic-numbers:0 */
	applySpecialValidation (opt) {
		// check for capture
		let
			i = 0,
			p = null,
			sq = null,
			squares = [
				this.board.getNeighborSquare(opt.origin,
					opt.piece.side === SideType.White ?
							NeighborType.AboveLeft :
							NeighborType.BelowLeft),
				this.board.getNeighborSquare(opt.origin,
					opt.piece.side === SideType.White ?
							NeighborType.AboveRight :
							NeighborType.BelowRight)];

		// check for capture
		for (i = 0; i < squares.length; i++) {
			// check for enemy piece on square
			p = squares[i] ? squares[i].piece : null;
			if (p && p.side !== opt.piece.side) {
				opt.destSquares.push(squares[i]);
			}
		}

		// check for double square first move
		if (opt.piece.moveCount === 0 &&
				opt.destSquares.length && // Fix for issue #15 (originally looked for length of 1)
				opt.destSquares[0].piece === null) { // Fix for issue #1
			sq = this.board.getNeighborSquare(
				opt.destSquares[0],
				opt.piece.side === SideType.White ?
						NeighborType.Above :
						NeighborType.Below);

			if (!sq.piece) {
				opt.destSquares.push(sq);
			}

		// check for en passant
		} else if (opt.origin.rank ===
				(opt.piece.side === SideType.White ? 5 : 4)) {
			// get squares left & right of pawn
			squares = [
				this.board.getNeighborSquare(opt.origin, NeighborType.Left),
				this.board.getNeighborSquare(opt.origin, NeighborType.Right)];
			i = 0;

			for (i = 0; i < squares.length; i++) {
				// check for pawn on square
				p = squares[i] ? squares[i].piece : null;
				if (p &&
						p.type === PieceType.Pawn &&
						p.side !== opt.piece.side &&
						p.moveCount === 1 &&
						this.board.lastMovedPiece === p) {

					opt.destSquares.push(
						this.board.getNeighborSquare(
							squares[i],
							p.side === SideType.Black ?
									NeighborType.Above :
									NeighborType.Below));
				}
			}
		}
	}
}

export class QueenValidation extends PieceValidation {
	constructor (board) {
		super(board);

		// base validation properties
		this.allowBackward = true;
		this.allowDiagonal = true;
		this.allowForward = true;
		this.allowHorizontal = true;
		this.repeat = 8;
		this.type = PieceType.Queen;
	}
}

export class RookValidation extends PieceValidation {
	constructor (board) {
		super(board);

		// base validation properties
		this.allowBackward = true;
		this.allowForward = true;
		this.allowHorizontal = true;
		this.repeat = 8;
		this.type = PieceType.Rook;
	}
}

export default { PieceValidation };
