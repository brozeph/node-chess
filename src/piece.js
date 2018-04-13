/**
	The Piece is a definition of a piece that can be played on the board.

	The uid property of the Piece is not intended to be durable across
	sessions, but only to uniquely identify the piece on the board. Right
	now the property is used by board.getSquareByPiece as pieces are not
	otherwise uniquely identifiable (i.e. getSquareByPiece(Pawn) would
	return the first square found with a Pawn on it rather than the exact
	square intended). Additionally, the uid of the Piece is used in
	BoardValidation to ensure there is correllation between the piece and
	valid squares to which the piece can move.
*/

// types
export var PieceType = {
	Bishop : 'bishop',
	King : 'king',
	Knight : 'knight',
	Pawn : 'pawn',
	Queen : 'queen',
	Rook : 'rook'
};

export var SideType = {
	Black : { name : 'black' },
	White : { name : 'white' }
};

export class Piece {
	constructor (side, notation) {
		this.moveCount = 0;
		this.notation = notation;
		this.side = side;
		this.type = null;
	}

	static createBishop (side) {
		return new Bishop(side);
	}

	static createKing (side) {
		return new King(side);
	}

	static createKnight (side) {
		return new Knight(side);
	}

	static createPawn (side) {
		return new Pawn(side);
	}

	static createQueen (side) {
		return new Queen(side);
	}

	static createRook (side) {
		return new Rook(side);
	}
}

export class Bishop extends Piece {
	constructor (side) {
		super(side, 'B');

		this.type = PieceType.Bishop;
	}
}

export class King extends Piece {
	constructor (side) {
		super(side, 'K');

		this.type = PieceType.King;
	}
}

export class Knight extends Piece {
	constructor (side) {
		super(side, 'N');

		this.type = PieceType.Knight;
	}
}

export class Pawn extends Piece {
	constructor (side) {
		super(side, '');

		this.type = PieceType.Pawn;
	}
}

export class Queen extends Piece {
	constructor (side) {
		super(side, 'Q');

		this.type = PieceType.Queen;
	}
}

export class Rook extends Piece {
	constructor (side) {
		super(side, 'R');

		this.type = PieceType.Rook;
	}
}

export default {
	Piece,
	PieceType,
	SideType
};
