/**
	GameValidation is the 3rd phase of validation for the game
	and is intended to support Game level events. Examples of Game
	scope validation include Check, Checkmate, 3-fold position 
	repetition and pawn promotion.
*/

var piece = require('./piece.js'),
	board = require('./board.js'),
	boardValidation = require('./boardValidation.js');

// base ctor
var GameValidation = function (g) {
	'use strict';

	this.game = g;
};

GameValidation.prototype.findKingSquare = function (side) {
	'use strict';

	var i = 0,
		squares = this.game.board.getSquares(side);

	for (i = 0; i < squares.length; i++) {
		if (squares[i].piece.type === piece.PieceType.King) {
			return squares[i];
		}
	}
};

GameValidation.prototype.isRepetition = function () {
	'use strict';

	var hash = '',
		hashCount = [],
		i = 0;

	// analyze 3-fold repetition (draw)
	for (i = 0; i < this.game.moveHistory.length; i++) {
		hash = this.game.moveHistory[i].hashCode;
		hashCount[hash] = hashCount[hash] ? hashCount[hash] + 1 : 1;

		if (hashCount[hash] === 3) {
			return true;
		}
	}

	return false;
};

GameValidation.prototype.start = function (callback) {
	'use strict';

	var err = null,
		isKingAttacked = false,
		kingSquare = null,
		result = {
			isCheck : false,
			isCheckmate : false,
			isFiftyMoveDraw : false,
			isStalemate : false,
			isRepetition : false,
			validMoves : []
		},
		setResult = function (v, result, isKingAttacked) {
			return function (err, moves) {
				result.isCheck = isKingAttacked && moves.length > 0;
				result.isCheckmate = isKingAttacked && moves.length === 0;
				result.isStalemate = !isKingAttacked &&  moves.length === 0;
				result.isRepetition = v.isRepetition();
				result.validMoves = moves;
			};
		},
		v = boardValidation.create(this.game);

	if (this.game) {
		// find current side king square
		kingSquare = this.findKingSquare(this.game.getCurrentSide());

		// find valid moves
		v.start(setResult(this, result, v.isSquareAttacked(kingSquare)));
	} else {
		err = 'game is invalid';
	}

	if (callback) {
		callback(err, result);
	}
};

// exports
module.exports = {
	create : function (g) {
		'use strict';

		return new GameValidation(g);
	}
};