/**
	The simple definition of a rank & file within a board.

	Additionally, if a Piece occupies a square on a board, the
	square contains the reference to the piece.
*/

// ctor
var Square = function (f, r) {
	'use strict';

	this.file = f;
	this.rank = r;
	this.piece = null;
};

// exports
module.exports = {
	create : function (f, r) {
		'use strict';

		return new Square(f, r);
	}
};