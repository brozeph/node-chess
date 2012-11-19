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

var sys = require('util'),
	piece = require('./piece.js'),
	board = require('./board.js');

// base ctor
var PieceValidation = function (b) {
	'use strict';

	this.allowBackward = false;
	this.allowDiagonal = false;
	this.allowForward = false;
	this.allowHorizontal = false;
	this.board = b;
	this.type = null;
	this.repeat = 0;
};

// methods
PieceValidation.prototype.applySpecialValidation = function (opt) {
	'use strict';
	// do nothing...
};

PieceValidation.prototype.start = function (src, callback) {
	'use strict';

	var err = null,
		opt = {
			destSquares : [],
			piece : src ? src.piece : null,
			origin : src
		},
		findMoveOptions = function (b, r, n) {
			var block = false,
				capture = false,
				currentSquare = b.getNeighborSquare(opt.origin, n),
				i = 0;

			while (currentSquare && i < r) {
				block = currentSquare.piece !== null &&
					(opt.piece.type === piece.PieceType.Pawn ||
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
		err = 'piece is invalid';
	} else if (this.board && opt.origin) {
		// forward squares
		if (this.allowForward) {
			findMoveOptions(this.board, this.repeat,
				opt.piece.side === piece.SideType.White ?
						board.NeighborType.Above :
						board.NeighborType.Below);
		}

		// backward squares
		if (this.allowBackward) {
			findMoveOptions(this.board, this.repeat,
				opt.piece.side === piece.SideType.White ?
						board.NeighborType.Below :
						board.NeighborType.Above);
		}

		// horizontal squares
		if (this.allowHorizontal) {
			findMoveOptions(this.board, this.repeat, board.NeighborType.Left);
			findMoveOptions(this.board, this.repeat, board.NeighborType.Right);
		}

		// diagonal squares
		if (this.allowDiagonal) {
			findMoveOptions(this.board, this.repeat, board.NeighborType.AboveLeft);
			findMoveOptions(this.board, this.repeat, board.NeighborType.BelowRight);
			findMoveOptions(this.board, this.repeat, board.NeighborType.BelowLeft);
			findMoveOptions(this.board, this.repeat, board.NeighborType.AboveRight);
		}

		// apply additional validation logic
		this.applySpecialValidation(opt);

	} else {
		err = 'board is invalid';
	}

	// callback
	if (callback) {
		callback(err, opt.destSquares);
	}
};

// bishop Validation ctor
var BishopValidation = function (b) {
	'use strict';

	// base
	PieceValidation.call(this, b);

	this.allowDiagonal = true;
	this.type = piece.PieceType.Bishop;
	this.repeat = 8;
};

sys.inherits(BishopValidation, PieceValidation);

// king Validation ctor
var KingValidation = function (b) {
	'use strict';

	// base
	PieceValidation.call(this, b);

	this.allowBackward = true;
	this.allowDiagonal = true;
	this.allowForward = true;
	this.allowHorizontal = true;
	this.type = piece.PieceType.King;
	this.repeat = 1;
};

sys.inherits(KingValidation, PieceValidation);

// methods
KingValidation.prototype.applySpecialValidation = function (opt) {
	'use strict';

	// check for castle
};

// knight Validation ctor
var KnightValidation = function (b) {
	'use strict';

	// base
	PieceValidation.call(this, b);

	this.type = piece.PieceType.Knight;
	this.repeat = 1;
};

sys.inherits(KnightValidation, PieceValidation);

// methods
KnightValidation.prototype.applySpecialValidation = function (opt) {
	'use strict';

	// add knight move options
	var aboveLeft = this.board.getNeighborSquare(
			opt.origin,
			board.NeighborType.AboveLeft
		),
		aboveRight = this.board.getNeighborSquare(
			opt.origin,
			board.NeighborType.AboveRight
		),
		belowLeft = this.board.getNeighborSquare(
			opt.origin,
			board.NeighborType.BelowLeft
		),
		belowRight = this.board.getNeighborSquare(
			opt.origin,
			board.NeighborType.BelowRight
		),
		squares = [],
		i = 0,
		p = null;

	if (aboveLeft) {
		squares.push(this.board.getNeighborSquare(
			aboveLeft,
			board.NeighborType.Above
		));
		squares.push(this.board.getNeighborSquare(
			aboveLeft,
			board.NeighborType.Left
		));
	}

	if (aboveRight) {
		squares.push(this.board.getNeighborSquare(
			aboveRight,
			board.NeighborType.Above
		));
		squares.push(this.board.getNeighborSquare(
			aboveRight,
			board.NeighborType.Right
		));
	}

	if (belowLeft) {
		squares.push(this.board.getNeighborSquare(
			belowLeft,
			board.NeighborType.Below
		));
		squares.push(this.board.getNeighborSquare(
			belowLeft,
			board.NeighborType.Left
		));
	}

	if (belowRight) {
		squares.push(this.board.getNeighborSquare(
			belowRight,
			board.NeighborType.Below
		));
		squares.push(this.board.getNeighborSquare(
			belowRight,
			board.NeighborType.Right
		));
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
};

// pawn Validation ctor
var PawnValidation = function (b) {
	'use strict';

	// base
	PieceValidation.call(this, b);

	this.allowForward = true;
	this.type = piece.PieceType.Pawn;
	this.repeat = 1;
};

sys.inherits(PawnValidation, PieceValidation);

// methods
PawnValidation.prototype.applySpecialValidation = function (opt) {
	'use strict';

	// check for capture
	var squares = [
		this.board.getNeighborSquare(opt.origin,
			opt.piece.side === piece.SideType.White ?
					board.NeighborType.AboveLeft :
					board.NeighborType.BelowLeft),
		this.board.getNeighborSquare(opt.origin,
			opt.piece.side === piece.SideType.White ?
					board.NeighborType.AboveRight :
					board.NeighborType.BelowRight)],
		i = 0,
		sq = null,
		p = null;

	for (i = 0; i < squares.length; i++) {
		// check for enemy piece on square
		p = squares[i] ? squares[i].piece : null;
		if (p && p.side !== opt.piece.side) {
			opt.destSquares.push(squares[i]);
		}
	}

	// check for double square first move
	if (opt.piece.moveCount === 0 &&
			opt.destSquares.length === 1 &&
			opt.destSquares[0].piece === null) { // Fix for issue #1
		sq = this.board.getNeighborSquare(
			opt.destSquares[0],
			opt.piece.side === piece.SideType.White ?
					board.NeighborType.Above :
					board.NeighborType.Below
		);

		if (!sq.piece) {
			opt.destSquares.push(sq);
		}

	// check for en passant
	} else if (opt.origin.rank ===
			(opt.piece.side === piece.SideType.White ? 5 : 4)) {
		// get squares left & right of pawn
		squares = [this.board.getNeighborSquare(opt.origin, board.NeighborType.Left),
			this.board.getNeighborSquare(opt.origin, board.NeighborType.Right)];
		i = 0;

		for (i = 0; i < squares.length; i++) {
			// check for pawn on square
			p = squares[i] ? squares[i].piece : null;
			if (p &&
					p.type === piece.PieceType.Pawn &&
					p.side !== opt.piece.side &&
					p.moveCount === 1) {
				opt.destSquares.push(
					this.board.getNeighborSquare(
						squares[i],
						p.side === piece.SideType.Black ?
								board.NeighborType.Above :
								board.NeighborType.Below
					)
				);
			}
		}
	}
};

// queen Validation ctor
var QueenValidation = function (b) {
	'use strict';

	// base
	PieceValidation.call(this, b);

	this.allowBackward = true;
	this.allowDiagonal = true;
	this.allowForward = true;
	this.allowHorizontal = true;
	this.type = piece.PieceType.Queen;
	this.repeat = 8;
};

sys.inherits(QueenValidation, PieceValidation);

// rook Validation ctor
var RookValidation = function (b) {
	'use strict';

	// base
	PieceValidation.call(this, b);

	this.allowBackward = true;
	this.allowForward = true;
	this.allowHorizontal = true;
	this.type = piece.PieceType.Rook;
	this.repeat = 8;
};

sys.inherits(RookValidation, PieceValidation);

// exports
module.exports = {
	create : function (p, b) {
		'use strict';

		switch (p) {
		case piece.PieceType.Bishop:
			return new BishopValidation(b);
		case piece.PieceType.King:
			return new KingValidation(b);
		case piece.PieceType.Knight:
			return new KnightValidation(b);
		case piece.PieceType.Pawn:
			return new PawnValidation(b);
		case piece.PieceType.Queen:
			return new QueenValidation(b);
		case piece.PieceType.Rook:
			return new RookValidation(b);
		default:
			return null;
		}
	}
};