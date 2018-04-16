import { Game } from './game';
import { Piece } from './piece';

var gameValidation = require('./gameValidation.js');

// private methods
var isMoveValid = function (src, dest, validMoves) {
	'use strict';

	var i = 0,
		isFound = function (expr, sq) {
			return ((typeof expr === 'string' && sq.file + sq.rank === expr) ||
				(expr.rank && expr.file &&
					sq.file === expr.file && sq.rank === expr.rank));
		},
		squares = [];

	for (i = 0; i < validMoves.length; i++) {
		if (isFound(src, validMoves[i].src)) {
			squares = validMoves[i].squares;
		}
	}

	if (squares && squares.length > 0) {
		for (i = 0; i < squares.length; i++) {
			if (isFound(dest, squares[i])) {
				return true;
			}
		}
	}

	return false;
};

var updateGameClient = function (gameClient) {
	'use strict';

	gameClient.validation.start(function (err, result) {
		if (err) {
			throw new Error(err);
		}

		gameClient.isCheck = result.isCheck;
		gameClient.isCheckmate = result.isCheckmate;
		gameClient.isRepetition = result.isRepetition;
		gameClient.isStalemate = result.isStalemate;
		gameClient.validMoves = result.validMoves;
	});
};

// ctor
export class SimpleGameClient {
	constructor (game) {
		this.isCheck = false;
		this.isCheckmate = false;
		this.isRepetition = false;
		this.isStalemate = false;
		this.game = game;
		this.validMoves = [];
		this.validation = gameValidation.create(this.game);
	}

	static create () {
		let
			game = Game.create(),
			gameClient = new SimpleGameClient(game);

		updateGameClient(gameClient);

		return gameClient;
	}

	getStatus (forceUpdate) {
		if (forceUpdate) {
			updateGameClient(this);
		}

		return {
			board : this.game.board,
			isCheck : this.isCheck,
			isCheckmate : this.isCheckmate,
			isRepetition : this.isRepetition,
			isStalemate : this.isStalemate,
			validMoves : this.validMoves
		};
	}

	move (src, dest, promo) {
		let
			move = null,
			side = this.game.getCurrentSide();

	if (src && dest && isMoveValid(src, dest, this.validMoves)) {
		move = this.game.board.move(src, dest);

		if (move) {
			// apply pawn promotion if applicable
			if (promo) {
				let piece;

				switch (promo) {
					case 'B':
						piece = Piece.createBishop(side);
						break;
					case 'N':
						piece = Piece.createKnight(side);
						break;
					case 'Q':
						piece = Piece.createQueen(side);
						break;
					case 'R':
						piece = Piece.createRook(side);
						break;
					default:
						piece = null;
						break;
				}

				if (piece) {
					this.game.board.promote(move.move.postSquare, piece);
					/*
					p.moveCount = move.move.postSquare.piece.moveCount;
					move.move.postSquare.piece = p;
					//*/
				}
			}

			updateGameClient(this);
			return move;
		}
	}

	throw new Error(`Move is invalid (${ src } to ${ dest })`);
	}
}

export default { SimpleGameClient };
