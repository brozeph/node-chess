import { Game } from './game';
import { Piece, PieceType } from './piece';

var gameValidation = require('./gameValidation.js');

// private methods
var getNotationPrefix = function (src, dest, movesForPiece) {
	'use strict';

	var
		containsDest = function (squares) {
			var n = 0;

			for (n = 0; n < squares.length; n++) {
				if (squares[n] === dest) {
					return true;
				}
			}

			return false;
		},
		i = 0,
		file = '',
		fileHash = {},
		prefix = src.piece.notation,
		rank = 0,
		rankHash = {};

	for (i = 0; i < movesForPiece.length; i++) {
		if (containsDest(movesForPiece[i].squares)) {
			file = movesForPiece[i].src.file;
			rank = movesForPiece[i].src.rank;

			fileHash[file] = (typeof fileHash[file] !== 'undefined' ? fileHash[file] + 1 : 1);
			rankHash[rank] = (typeof rankHash[rank] !== 'undefined' ? rankHash[rank] + 1 : 1);
		}
	}

	if (Object.keys(fileHash).length > 1) {
		prefix += src.file;
	}

	if (Object.keys(rankHash).length > Object.keys(fileHash).length) {
		prefix += src.rank;
	}

	return prefix;
};

var getValidMovesByPieceType = function (pieceType, validMoves) {
	'use strict';

	var byPiece = [],
		i = 0;

	for (i = 0; i < validMoves.length; i++) {
		if (validMoves[i].src.piece.type === pieceType) {
			byPiece.push(validMoves[i]);
		}
	}

	return byPiece;
};

var notate = function (validMoves, gameClient) {
	'use strict';

	var
		algebraicNotation = {},
		i = 0,
		isPromotion = false,
		movesForPiece = [],
		n = 0,
		p = null,
		prefix = '',
		suffix = '',
		sq = null;

	// iterate through each starting squares valid moves
	for (i = 0; i < validMoves.length; i++) {
		p = validMoves[i].src.piece;

		// iterate each potential move and build prefix and suffix for notation
		for (n = 0; n < validMoves[i].squares.length; n++) {
			prefix = '';
			sq = validMoves[i].squares[n];

			// set suffix for notation
			suffix = (sq.piece ? 'x' : '') + sq.file + sq.rank;

			// check for potential promotion
			isPromotion =
				(sq.rank === 8 || sq.rank === 1) &&
				p.type === PieceType.Pawn;

			// squares with pawns
			if (sq.piece && p.type === PieceType.Pawn) {
				prefix = validMoves[i].src.file;
			}

			// squares with Bishop, Knight, Queen or Rook pieces
			if (p.type === PieceType.Bishop ||
				p.type === PieceType.Knight ||
				p.type === PieceType.Queen ||
				p.type === PieceType.Rook) {
				// if there is more than 1 of the specified piece on the board,
				// can more than 1 land on the specified square?
				movesForPiece = getValidMovesByPieceType(p.type, validMoves);
				if (movesForPiece.length > 1) {
					prefix = getNotationPrefix(validMoves[i].src, sq, movesForPiece);
				} else {
					prefix = validMoves[i].src.piece.notation;
				}
			}

			// squares with a King piece
			if (p.type === PieceType.King) {
				// look for castle left and castle right
				if (validMoves[i].src.file === 'e' && sq.file === 'g') {
					// fix for issue #13 - if PGN is specified should be letters, not numbers
					prefix = gameClient.PGN ? 'O-O' : '0-0';
					suffix = '';
				} else if (validMoves[i].src.file === 'e' && sq.file === 'c') {
					// fix for issue #13 - if PGN is specified should be letters, not numbers
					prefix = gameClient.PGN ? 'O-O-O' : '0-0-0';
					suffix = '';
				} else {
					prefix = validMoves[i].src.piece.notation;
				}
			}

			// set the notation
			if (isPromotion) {
				// Rook promotion
				algebraicNotation[prefix + suffix + 'R'] = {
					src : validMoves[i].src,
					dest : sq
				};

				// Knight promotion
				algebraicNotation[prefix + suffix + 'N'] = {
					src : validMoves[i].src,
					dest : sq
				};

				// Bishop promotion
				algebraicNotation[prefix + suffix + 'B'] = {
					src : validMoves[i].src,
					dest : sq
				};

				// Queen promotion
				algebraicNotation[prefix + suffix + 'Q'] = {
					src : validMoves[i].src,
					dest : sq
				};
			} else {
				algebraicNotation[prefix + suffix] = {
					src : validMoves[i].src,
					dest : sq
				};
			}
		}
	}

	return algebraicNotation;
};

var parseNotation = function (notation) {
	'use strict';

	var parseDest = '';

	// try and parse the notation
	parseDest = notation.substring(notation.length - 2);
	if (notation.length > 2) {
		return notation.charAt(0) + parseDest;
	}

	return '';
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
		gameClient.notatedMoves = notate(result.validMoves, gameClient);
		gameClient.validMoves = result.validMoves;
	});
};

// ctor
var AlgebraicGameClient = function (g, opts) {
	'use strict';

	this.isCheck = false;
	this.isCheckmate = false;
	this.isRepetition = false;
	this.isStalemate = false;
	this.game = g;
	this.notatedMoves = {};
	// for issue #13, adding options allowing consumers to specify
	// PGN (Portable Game Notation)... essentially, this makes castle moves
	// appear as capital letter O rather than the number 0
	this.PGN = (opts && typeof opts.PGN === 'boolean') ? opts.PGN : false;
	this.validMoves = [];
	this.validation = gameValidation.create(this.game);
};

AlgebraicGameClient.prototype.getStatus = function (forceUpdate) {
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
		notatedMoves : this.notatedMoves
	};
};

AlgebraicGameClient.prototype.move = function (notation, isFuzzy) {
	'use strict';

	var
		move = null,
		notationRegex = /[BKQNR]?[a-h]?[1-8]?x?[a-h][1-8]/,
		p = null,
		promo = '',
		side = this.game.getCurrentSide();

	if (notation && typeof notation === 'string') {
		// clean notation of extra or alternate chars
		notation = notation
			.replace(/\!/g, '')
			.replace(/\+/g, '')
			.replace(/\#/g, '')
			.replace(/\=/g, '')
			.replace(/\\/g, '');

			// fix for issue #13 - if PGN is specified, should be letters not numbers
			if (this.PGN) {
				notation = notation.replace(/0/g, 'O');
			} else {
				notation = notation.replace(/O/g, '0');
			}

		// check for pawn promotion
		if (notation.charAt(notation.length - 1).match(/[BNQR]/)) {
			promo = notation.charAt(notation.length - 1);
		}

		// use it directly or attempt to parse it if not found
		if (this.notatedMoves[notation]) {
			move = this.game.board.move(
				this.notatedMoves[notation].src,
				this.notatedMoves[notation].dest,
				notation);
		} else if (notation.match(notationRegex) && notation.length > 1 && !isFuzzy) {
			return this.move(parseNotation(notation), true);
		} else if (isFuzzy) {
			throw 'Invalid move (' + notation + ')';
		}

		if (move) {
			// apply pawn promotion
			if (promo) {
				switch (promo) {
					case 'B':
						p = Piece.createBishop(side);
						break;
					case 'N':
						p = Piece.createKnight(side);
						break;
					case 'Q':
						p = Piece.createQueen(side);
						break;
					case 'R':
						p = Piece.createRook(side);
						break;
				}

				if (p) {
					this.game.board.promote(move.move.postSquare, p);
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

	throw 'Notation is invalid (' + notation + ')';
};

// exports
module.exports = {
	create : function (opts) {
		'use strict';

		var
			g = Game.create(),
			gc = new AlgebraicGameClient(g, opts);

		updateGameClient(gc);
		return gc;
	}
};
