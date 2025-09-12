/* eslint sort-imports: 0 */
import { EventEmitter } from 'events';
import { Board } from './board.js';
import { Game } from './game.js';
import { GameValidation } from './gameValidation.js';
import { Piece } from './piece.js';
import { PieceType } from './piece.js';
import { SideType } from './piece.js';

// private methods
function getNotationPrefix (src, dest, movesForPiece) {
	let
		containsDest = (squares) => {
			let n = 0;

			for (; n < squares.length; n++) {
				if (squares[n] === dest) {
					return true;
				}
			}

			return false;
		},
		file = '',
		fileHash = {},
		i = 0,
		prefix = src.piece.notation,
		rank = 0,
		rankHash = {};

	for (; i < movesForPiece.length; i++) {
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
}

function getValidMovesByPieceType (pieceType, validMoves) {
	let
		byPiece = [],
		i = 0;

	for (; i < validMoves.length; i++) {
		if (validMoves[i].src.piece.type === pieceType) {
			byPiece.push(validMoves[i]);
		}
	}

	return byPiece;
}

function notate (validMoves, gameClient) {
	let
		algebraicNotation = {},
		i = 0,
		isPromotion = false,
		movesForPiece = [],
		n = 0,
		p = null,
		prefix = '',
		sq = null,
		src = null,
		suffix = '';

	// iterate through each starting squares valid moves
	for (; i < validMoves.length; i++) {
		src = validMoves[i].src;
		p = src.piece;

		// iterate each potential move and build prefix and suffix for notation
		for (n = 0; n < validMoves[i].squares.length; n++) {
			prefix = '';
			sq = validMoves[i].squares[n];

			// set suffix for notation
			suffix = (sq.piece ? 'x' : '') + sq.file + sq.rank;

			// check for potential promotion
			/* eslint no-magic-numbers: 0 */
			isPromotion =
				(sq.rank === 8 || sq.rank === 1) &&
				p.type === PieceType.Pawn;

			// squares with pawns
			if (sq.piece && p.type === PieceType.Pawn) {
				prefix = src.file;
			}

			// en passant
			// fix for #53
			if (p.type === PieceType.Pawn &&
				src.file !== sq.file &&
				!sq.piece) {
				prefix = [src.file, 'x'].join('');
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
					prefix = getNotationPrefix(src, sq, movesForPiece);
				} else {
					prefix = src.piece.notation;
				}
			}

			// squares with a King piece
			if (p.type === PieceType.King) {
				// look for castle left and castle right
				if (src.file === 'e' && sq.file === 'g') {
					// fix for issue #13 - if PGN is specified should be letters, not numbers
					prefix = gameClient.PGN ? 'O-O' : '0-0';
					suffix = '';
				} else if (src.file === 'e' && sq.file === 'c') {
					// fix for issue #13 - if PGN is specified should be letters, not numbers
					prefix = gameClient.PGN ? 'O-O-O' : '0-0-0';
					suffix = '';
				} else {
					prefix = src.piece.notation;
				}
			}

			// set the notation
			if (isPromotion) {
				// Rook promotion
				algebraicNotation[prefix + suffix + 'R'] = {
					dest : sq,
					src
				};

				// Knight promotion
				algebraicNotation[prefix + suffix + 'N'] = {
					dest : sq,
					src
				};

				// Bishop promotion
				algebraicNotation[prefix + suffix + 'B'] = {
					dest : sq,
					src
				};

				// Queen promotion
				algebraicNotation[prefix + suffix + 'Q'] = {
					dest : sq,
					src
				};
			} else {
				algebraicNotation[prefix + suffix] = {
					dest : sq,
					src
				};
			}
		}
	}

	return algebraicNotation;
}

function parseNotation (notation) {
	let
		captureRegex = /^[a-h]x[a-h][1-8]$/,
		parseDest = '';

	// try and parse the notation
	parseDest = notation.substring(notation.length - 2);

	if (notation.length > 2) {
		// check for preceding pawn capture style notation (i.e. a-h x)
		if (captureRegex.test(notation)) {
			return parseDest;
		}

		return notation.charAt(0) + parseDest;
	}

	return '';
}

function updateGameClient (gameClient) {
	gameClient.validation.start((err, result) => {
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
}

export class AlgebraicGameClient extends EventEmitter {
	constructor (game, opts) {
		super();

		this.game = game;
		this.isCheck = false;
		this.isCheckmate = false;
		this.isRepetition = false;
		this.isStalemate = false;
		this.notatedMoves = {};
		// for issue #13, adding options allowing consumers to specify
		// PGN (Portable Game Notation)... essentially, this makes castle moves
		// appear as capital letter O rather than the number 0
		this.PGN = (opts && typeof opts.PGN === 'boolean') ? opts.PGN : false;
		this.validMoves = [];
		this.validation = GameValidation.create(this.game);

		// bubble the game and board events
		['check', 'checkmate'].forEach((ev) => {
			this.game.on(ev, (data) => this.emit(ev, data));
		});

		['capture', 'castle', 'enPassant', 'move', 'promote', 'undo'].forEach((ev) => {
			this.game.board.on(ev, (data) => this.emit(ev, data));
		});

		let self = this;
		this.on('undo', () => {
			// force an update
			self.getStatus(true);
		});
	}

	static create (opts) {
		let
			game = Game.create(),
			gameClient = new AlgebraicGameClient(game, opts);

		updateGameClient(gameClient);

		return gameClient;
	}

	static fromFEN (fen, opts) {
		if (!fen || typeof fen !== 'string') {
			throw new Error('FEN must be a non-empty string');
		}

		// create a standard game so listeners/history are wired
		let 
			game = Game.create(),
			loadedBoard = Board.load(fen);

		// copy piece placement from loaded board to preserve board indexing and listeners
		for (let i = 0; i < game.board.squares.length; i++) {
			game.board.squares[i].piece = null;
		}

		for (let i = 0; i < loadedBoard.squares.length; i++) {
			let sq = loadedBoard.squares[i];
			if (sq.piece) {
				let target = game.board.getSquare(sq.file, sq.rank);
				target.piece = sq.piece;
			}
		}

		game.board.lastMovedPiece = null;

		// derive side to move from FEN (default to White if missing)
		let parts = fen.split(' ');
		let active = parts[1] || 'w';
		let baseSide = active === 'b' ? SideType.Black : SideType.White;

		// override getCurrentSide to honor FEN and alternate thereafter
		let whiteFirst = baseSide === SideType.White;

		/* eslint no-param-reassign: 0 */
		game.getCurrentSide = function getCurrentSideAfterFENLoad () {
			return (this.moveHistory.length % 2 === 0) ?
				(whiteFirst ? SideType.White : SideType.Black) :
				(whiteFirst ? SideType.Black : SideType.White);
		};

		const gameClient = new AlgebraicGameClient(game, opts);
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
			notatedMoves : this.notatedMoves
		};
	}

	getFen () {
		return this.game.board.getFen();
	}

	getCaptureHistory () {
		return this.game.captureHistory;
	}

	move (notation, isFuzzy) {
		let
			move = null,
			notationRegex = /^[BKQNR]?[a-h]?[1-8]?[x-]?[a-h][1-8][+#]?$/,
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
				throw new Error(`Invalid move (${notation})`);
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
						default:
							p = Piece.createPawn(side);
					}

					if (p) {
						this.game.board.promote(move.move.postSquare, p);
					}
				}

				updateGameClient(this);

				return move;
			}
		}

		throw new Error(`Notation is invalid (${notation})`);
	}
}

export default { AlgebraicGameClient };
