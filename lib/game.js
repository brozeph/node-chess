/**
	Games contain the history of a board and the board itself. 

	At time of writing this, the game is also intended to store some 
	degree of information regarding the opponents and keys that
	could be used for storage, etc.
*/

var crypto = require('crypto'),
	piece = require('./piece.js'),
	Square = require('./square.js'),
	board = require('./board.js');

// types
var Move = function (sq1, sq2, cp, h) {
	'use strict';

	this.capturedPiece = cp;
	this.hashCode = h;
	this.piece = sq2.piece;
	this.prevFile = sq1.file;
	this.prevRank = sq1.rank;
	this.postFile = sq2.file;
	this.postRank = sq2.rank;
};

// event handlers
var addToHistory = function (g) {
	'use strict';

	return function (ev) {
		var i = 0,
			hashCode = '',
			sum = crypto.createHash('md5');

		for (i = 0; i < g.board.squares.length; i++) {
			if (g.board.squares[i].piece !== null) {
				sum.update(g.board.squares[i].file +
					g.board.squares[i].rank +
					(g.board.squares[i].piece.side === piece.SideType.White ? 'w' : 'b') +
					g.board.squares[i].piece.notation +
					(i < (g.board.squares.length - 1) ? '-' : ''));
			}
		}

		// generate hash code for board
		hashCode = sum.digest('base64');

		// increment move history
		g.moveHistory.push(new Move(ev.prevSquare,
			ev.postSquare,
			ev.capturedPiece,
			hashCode));
	};
};

// ctor
var Game = function (b) {
	'use strict';

	this.board = b;
	this.moveHistory = [];
};

Game.prototype.getCurrentSide = function () {
	'use strict';

	return this.moveHistory.length % 2 === 0 ?
			piece.SideType.White :
			piece.SideType.Black;
};

// exports
module.exports = {
	// methods
	create : function () {
		'use strict';

		var b = board.create(),
			g = new Game(b);

		b.on('move', addToHistory(g));

		return g;
	},
	load : function (moveHistory) {
		'use strict';

		var b = board.create(),
			g = new Game(),
			i = 0;

		b.on('move', addToHistory(g));

		for (i = 0; i < moveHistory.length; i++) {
			b.move(b.getSquare(moveHistory[i].prevFile, moveHistory[i].prevRank),
				b.getSquare(moveHistory[i].postFile, moveHistory[i].postRank));
		}

		return g;
	}
};