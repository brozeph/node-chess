var piece = require('./piece.js'),
	board = require('./board.js'),
	game = require('./game.js'),
	gameValidation = require('./gameValidation.js');

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
var SimpleGameClient = function (g) {
	'use strict';

	this.isCheck = false;
	this.isCheckmate = false;
	this.isRepetition = false;
	this.isStalemate = false;
	this.game = g;
	this.validMoves = [];
	this.validation = gameValidation.create(this.game);
};

SimpleGameClient.prototype.getStatus = function (forceUpdate) {
	'use strict';

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
};

SimpleGameClient.prototype.move = function (src, dest, promo) {
	'use strict';

	var move = null,
		p = null,
		side = this.game.getCurrentSide();

	if (src && dest && isMoveValid(src, dest, this.validMoves)) {

		move = this.game.board.move(src, dest);

		if (move) {
			// apply pawn promotion
			if (promo) {
				switch (promo) {
				case 'B':
					p = piece.createBishop(side);
					break;
				case 'N':
					p = piece.createKnight(side);
					break;
				case 'Q':
					p = piece.createQueen(side);
					break;
				case 'R':
					p = piece.createRook(side);
					break;
				}

				if (p) {
					p.moveCount = move.move.postSquare.piece.moveCount;
					move.move.postSquare.piece = p;
				}
			}

			updateGameClient(this);
			return move;
		}
	}

	throw 'Move is invalid (' + src + ' to ' + dest + ')';
};

// exports
module.exports = {
	create : function () {
		'use strict';

		var g = game.create(),
			gc = new SimpleGameClient(g);

		updateGameClient(gc);
		return gc;
	}
};