/**
	GameValidation is the 3rd phase of validation for the game
	and is intended to support Game level events. Examples of Game
	scope validation include Check, Checkmate, 3-fold position
	repetition and pawn promotion.
*/
import { BoardValidation } from './boardValidation.js';
import { PieceType } from './piece.js';

export class GameValidation {
	constructor (game) {
		this.game = game;
	}

	static create (game) {
		return new GameValidation(game);
	}

	findKingSquare (side) {
		let
			i = 0,
			squares = this.game.board.getSquares(side);

		for (i = 0; i < squares.length; i++) {
			if (squares[i].piece.type === PieceType.King) {
				return squares[i];
			}
		}
	}

	isRepetition () {
		let
			hash = '',
			hashCount = [],
			i = 0;

		// analyze 3-fold repetition (draw)
		for (i = 0; i < this.game.moveHistory.length; i++) {
			hash = this.game.moveHistory[i].hashCode;
			hashCount[hash] = hashCount[hash] ? hashCount[hash] + 1 : 1;

			/* eslint no-magic-numbers: 0 */
			if (hashCount[hash] === 3) {
				return true;
			}
		}

		return false;
	}

	start (callback) {
		// ensure callback is set
		callback = callback || ((err, result) => new Promise((resolve, reject) => {
			if (err) {
				return reject(err);
			}

			return resolve(result);
		}));

		let
			kingSquare = null,
			result = {
				isCheck : false,
				isCheckmate : false,
				isFiftyMoveDraw : false,
				isRepetition : false,
				isStalemate : false,
				validMoves : []
			},
			setResult = (v, result, isKingAttacked) => {
				return (err, validMoves) => {
					if (err) {
						return callback(err);
					}

					result.isCheck = isKingAttacked && validMoves.length > 0;
					result.isCheckmate = isKingAttacked && validMoves.length === 0;
					result.isStalemate = !isKingAttacked && validMoves.length === 0;
					result.isRepetition = v.isRepetition();
					result.validMoves = validMoves;

					return callback(null, result);
				};
			},
			v = BoardValidation.create(this.game);

		if (this.game) {
			// find current side king square
			kingSquare = this.findKingSquare(this.game.getCurrentSide());

			// find valid moves
			return v.start(setResult(this, result, v.isSquareAttacked(kingSquare)));
		}
		
		return callback(new Error('game is invalid'));
	}
}

export default { GameValidation };
