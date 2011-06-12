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
var PieceType = {
	Bishop : 'bishop',
	King : 'king',
	Knight : 'knight',
	Pawn : 'pawn',
	Queen : 'queen',
	Rook : 'rook'
};

var SideType = {
	Black : { name : 'black' },
	White : { name : 'white' }
};

// base ctor
var Piece = function(side) {
	this.moveCount = 0;
	this.side = side;
};

// concrete ctors
var Bishop = function(side) {
	Piece.call(this, side);
 
	this.type = PieceType.Bishop; 
	this.notation = 'B'; 
};

var King = function(side) {
	Piece.call(this, side);

	this.type = PieceType.King; 
	this.notation = 'K';
};

var Knight = function(side) {
	Piece.call(this, side);
 
	this.type = PieceType.Knight; 
	this.notation = 'N'; 
};

var Pawn = function(side) {
	Piece.call(this, side);

	this.type = PieceType.Pawn; 
	this.notation = ''; 
};

var Queen = function(side) {
	Piece.call(this, side);

	this.type = PieceType.Queen; 
	this.notation = 'Q'; 
};

var Rook = function(side) {
	Piece.call(this, side);

	this.type = PieceType.Rook; 
	this.notation = 'R'; 
};

// exports
module.exports = {
	// methods
	createBishop : function(side) {
		return new Bishop(side);
	},
	createKing : function(side) {
		return new King(side);
	},
	createKnight : function(side) {
		return new Knight(side);
	},
	createPawn : function(side) {
		return new Pawn(side);
	},
	createQueen : function(side) {
		return new Queen(side);
	},
	createRook : function(side) {
		return new Rook(side);
	},
	
	// enums
	PieceType : PieceType,
	SideType : SideType
};