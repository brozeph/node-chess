var assert = require('assert'),
	board = require('../lib/board.js'),
	piece = require('../lib/piece.js');

// ensure 64 squares
module.exports.testBoard_SquareCount = function() {
	var b = board.create();
	assert.strictEqual(b.squares.length, 64);
};

// ensure squares retrieved via getSquare are correct
module.exports.testBoard_GetSquare_1a = function() {
	var b = board.create(),
		s = b.getSquare('a', 1);

	assert.strictEqual(s.rank, 1);
	assert.strictEqual(s.file, 'a');
};

// ensure shorthand for getSquare works as expected
module.exports.testBoard_GetSquare_Shorthand = function() {
	var b = board.create(),
		s = b.getSquare('a1');

	assert.strictEqual(s.rank, 1);
	assert.strictEqual(s.file, 'a');
};

// ensure squares retrieved via getSquare are correct
module.exports.testBoard_GetSquare_8a = function() {
	var b = board.create(),
		s = b.getSquare('a', 8);

	assert.strictEqual(s.rank, 8);
	assert.strictEqual(s.file, 'a');
};

// ensure squares retrieved via getSquare are correct
module.exports.testBoard_GetSquare_1h = function() {
	var b = board.create(),
		s = b.getSquare('h', 1);

	assert.strictEqual(s.rank, 1);
	assert.strictEqual(s.file, 'h');
};

// ensure squares retrieved via getSquare are correct
module.exports.testBoard_GetSquare_8h = function() {
	var b = board.create(),
		s = b.getSquare('h', 8);

	assert.strictEqual(s.rank, 8);
	assert.strictEqual(s.file, 'h');
};

// ensure squares retrieved via getSquare are correct
module.exports.testBoard_GetSquare_5e = function() {
	var b = board.create(),
		s = b.getSquare('e', 5);

	assert.strictEqual(s.rank, 5);
	assert.strictEqual(s.file, 'e');
};

// ensure squares requested with invalid data are null
module.exports.testBoard_GetSquare_InvalidRank = function() {
	var b = board.create();
	
	assert.equal(b.getSquare('a', 0), null);
};

// ensure squares requested with invalid data are null
module.exports.testBoard_GetSquare_InvalidFile = function() {
	var b = board.create();
	
	assert.equal(b.getSquare('i', 1), null);
};

// ensure corrupted board returns null square
module.exports.testBoard_GetSquare_CorruptBoard = function() {
	var b = board.create();
	b.squares = [];
	
	assert.equal(b.getSquare('a', 1), null);
};

// ensure pieces are placed properly on squares
module.exports.testBoard_GetSquare_WhiteKing = function() {
	var b = board.create(),
		p = b.getSquare('e', 1).piece;

	assert.strictEqual(p.type, piece.PieceType.King);
	assert.strictEqual(p.side, piece.SideType.White);
};

// ensure pieces are placed properly on squares
module.exports.testBoard_GetSquare_BlackQueen = function() {
	var b = board.create(),
		p = b.getSquare('d', 8).piece;
	
	assert.strictEqual(p.type, piece.PieceType.Queen);
	assert.strictEqual(p.side, piece.SideType.Black);
};

// ensure moveCount of piece isn't incremented during board create
module.exports.testBoard_GetSquare_PieceHasNoMoveCount = function() {
	var b = board.create(),
		p = b.getSquare('d', 2).piece;
	
	assert.strictEqual(p.type, piece.PieceType.Pawn);
	assert.strictEqual(p.side, piece.SideType.White);
	assert.strictEqual(p.moveCount, 0);
};

// validate getSquares(piece.SideType) works correctly
module.exports.testBoard_GetSquares_White = function() {
	var b = board.create(),
		squares = b.getSquares(piece.SideType.White),
		pawnCount = 0,
		kingCount = 0,
		i = 0;

	assert.strictEqual(squares.length, 16);
	assert.strictEqual(squares[i].piece.side, piece.SideType.White);

	for (; i < squares.length; i++) {
		if (squares[i].piece.type === piece.PieceType.Pawn) {
			pawnCount++;
		} else if (squares[i].piece.type === piece.PieceType.King) {
			kingCount++;
		}
	}
	
	assert.strictEqual(pawnCount, 8);
	assert.strictEqual(kingCount, 1);
};

// validate getSquares(piece.SideType) works correctly
module.exports.testBoard_GetSquares_Black = function() {
	var b = board.create(),
		squares = b.getSquares(piece.SideType.Black),
		pawnCount = 0,
		kingCount = 0,
		i = 0;

	assert.strictEqual(squares.length, 16);
	assert.strictEqual(squares[i].piece.side, piece.SideType.Black);
	
	for (; i < squares.length; i++) {
		if (squares[i].piece.type === piece.PieceType.Pawn) {
			pawnCount++;
		} else if (squares[i].piece.type === piece.PieceType.King) {
			kingCount++;
		}
	}
	
	assert.strictEqual(pawnCount, 8);
	assert.strictEqual(kingCount, 1);
};

// verify getNeighborSquare(board.NeighborType)
module.exports.testBoard_GetNeighborSquare_Above = function() {
	var b = board.create(),
		sq1 = b.getSquare('e', 2),
		sq2 = b.getNeighborSquare(sq1, board.NeighborType.Above);

	assert.strictEqual(sq2.rank, 3);
	assert.strictEqual(sq2.file, 'e');
};

// verify getNeighborSquare(board.NeighborType) returns null for invalid boundaries
module.exports.testBoard_GetNeighborSquare_AboveWhenOnRank8 = function() {
	var b = board.create(),
		sq1 = b.getSquare('a', 8),
		sq2 = b.getNeighborSquare(sq1, board.NeighborType.Above);

	assert.strictEqual(sq2, null);
};

// verify getNeighborSquare(board.NeighborType)
module.exports.testBoard_GetNeighborSquare_AboveLeft = function() {
	var b = board.create(),
		sq1 = b.getSquare('e', 2),
		sq2 = b.getNeighborSquare(sq1, board.NeighborType.AboveLeft);

	assert.strictEqual(sq2.rank, 3);
	assert.strictEqual(sq2.file, 'd');
};

// verify getNeighborSquare(board.NeighborType)
module.exports.testBoard_GetNeighborSquare_AboveRight = function() {
	var b = board.create(),
		sq1 = b.getSquare('e', 2),
		sq2 = b.getNeighborSquare(sq1, board.NeighborType.AboveRight);

	assert.strictEqual(sq2.rank, 3);
	assert.strictEqual(sq2.file, 'f');
};

// verify getNeighborSquare(board.NeighborType)
module.exports.testBoard_GetNeighborSquare_Below = function() {
	var b = board.create(),
		sq1 = b.getSquare('e', 2),
		sq2 = b.getNeighborSquare(sq1, board.NeighborType.Below);

	assert.strictEqual(sq2.rank, 1);
	assert.strictEqual(sq2.file, 'e');
};

// verify getNeighborSquare(board.NeighborType) returns null for invalid boundaries
module.exports.testBoard_GetNeighborSquare_BelowWhenOnRank1 = function() {
	var b = board.create(),
		sq1 = b.getSquare('a', 1),
		sq2 = b.getNeighborSquare(sq1, board.NeighborType.Below);

	assert.strictEqual(sq2, null);
};

// verify getNeighborSquare(board.NeighborType)
module.exports.testBoard_GetNeighborSquare_BelowLeft = function() {
	var b = board.create(),
		sq1 = b.getSquare('e', 2),
		sq2 = b.getNeighborSquare(sq1, board.NeighborType.BelowLeft);

	assert.strictEqual(sq2.rank, 1);
	assert.strictEqual(sq2.file, 'd');
};

// verify getNeighborSquare(board.NeighborType)
module.exports.testBoard_GetNeighborSquare_BelowRight = function() {
	var b = board.create(),
		sq1 = b.getSquare('e', 2),
		sq2 = b.getNeighborSquare(sq1, board.NeighborType.BelowRight);

	assert.strictEqual(sq2.rank, 1);
	assert.strictEqual(sq2.file, 'f');
};

// verify getNeighborSquare(board.NeighborType)
module.exports.testBoard_GetNeighborSquare_Left = function() {
	var b = board.create(),
		sq1 = b.getSquare('e', 2),
		sq2 = b.getNeighborSquare(sq1, board.NeighborType.Left);

	assert.strictEqual(sq2.rank, 2);
	assert.strictEqual(sq2.file, 'd');
};

// verify getNeighborSquare(board.NeighborType) returns null for invalid boundaries
module.exports.testBoard_GetNeighborSquare_LeftWhenOnFileA = function() {
	var b = board.create(),
		sq1 = b.getSquare('a', 2),
		sq2 = b.getNeighborSquare(sq1, board.NeighborType.Left);

	assert.strictEqual(sq2, null);
};

// verify getNeighborSquare(board.NeighborType)
module.exports.testBoard_GetNeighborSquare_Right = function() {
	var b = board.create(),
		sq1 = b.getSquare('e', 2),
		sq2 = b.getNeighborSquare(sq1, board.NeighborType.Right);

	assert.strictEqual(sq2.rank, 2);
	assert.strictEqual(sq2.file, 'f');
};

// verify getNeighborSquare(board.NeighborType) returns null for invalid boundaries
module.exports.testBoard_GetNeighborSquare_RightWhenOnFileH = function() {
	var b = board.create(),
		sq1 = b.getSquare('h', 2),
		sq2 = b.getNeighborSquare(sq1, board.NeighborType.Right);

	assert.strictEqual(sq2, null);
};

// verify that moving a piece actually results in the piece being moved
module.exports.testBoard_MovePiece = function() {
	var b = board.create();

	b.move(b.getSquare('e', 2), b.getSquare('e', 4));
	b.move(b.getSquare('f', 7), b.getSquare('f', 5));
	b.move(b.getSquare('d', 1), b.getSquare('h', 5));

	assert.strictEqual(b.getSquare('e', 4).piece.type, piece.PieceType.Pawn);
	assert.strictEqual(b.getSquare('f', 5).piece.type, piece.PieceType.Pawn);
	assert.strictEqual(b.getSquare('h', 5).piece.type, piece.PieceType.Queen);
};

// ensure shorthand for move works as expected
module.exports.testBoard_MovePiece_Shorthand = function() {
	var b = board.create();

	b.move('e2', 'e4');

	assert.strictEqual(b.getSquare('e', 4).piece.type, piece.PieceType.Pawn);
};

// verify simulation of move provides backout method that doesn't corrupt board
module.exports.testBoard_SimulateMovePiece_Backout = function() {
	var b = board.create(),
		r = b.move(b.getSquare('e', 2), b.getSquare('e', 4), true);

	assert.strictEqual(b.getSquare('e', 2).piece, null);
	assert.strictEqual(b.getSquare('e', 4).piece.type, piece.PieceType.Pawn);

	r.undo();
	
	assert.strictEqual(b.getSquare('e', 4).piece, null);
	assert.strictEqual(b.getSquare('e', 2).piece.type, piece.PieceType.Pawn);
};

// validate board.move for en-passant and proper capture of opposing pawn
module.exports.testBoard_MovePiece_EnPassant = function() {
	var b = board.create();

	b.move(b.getSquare('e', 2), b.getSquare('e', 4));
	b.move(b.getSquare('e', 7), b.getSquare('e', 6));
	b.move(b.getSquare('e', 4), b.getSquare('e', 5));
	b.move(b.getSquare('f', 7), b.getSquare('f', 5));
	b.move(b.getSquare('e', 5), b.getSquare('f', 6));

	assert.strictEqual(b.getSquare('f', 5).piece, null);
};

// validate simulated board.move undo for en-passant
module.exports.testBoard_MovePiece_EnPassant_Undo = function() {
	var b = board.create(),
		r = null;

	b.move(b.getSquare('e', 2), b.getSquare('e', 4));
	b.move(b.getSquare('e', 7), b.getSquare('e', 6));
	b.move(b.getSquare('e', 4), b.getSquare('e', 5));
	b.move(b.getSquare('f', 7), b.getSquare('f', 5));

	r = b.move(b.getSquare('e', 5), b.getSquare('f', 6), true);

	assert.strictEqual(b.getSquare('f', 5).piece, null);

	r.undo();

	assert.ok(b.getSquare('f', 5).piece !== null);
	assert.strictEqual(b.getSquare('f', 5).piece.type, piece.PieceType.Pawn);
};

// validate board.move for castle and proper swap with rook
module.exports.testBoard_MovePiece_KingCastle_Right = function() {
	var b = board.create();

	b.getSquare('f', 8).piece = null;
	b.getSquare('g', 8).piece = null;

	b.move(b.getSquare('e', 8), b.getSquare('g', 8));

	assert.ok(b.getSquare('f', 8).piece !== null);
	assert.ok(b.getSquare('h', 8).piece === null);
	assert.strictEqual(b.getSquare('f', 8).piece.type, piece.PieceType.Rook);
};

// validate board.move for castle and proper swap with rook
module.exports.testBoard_MovePiece_KingCastle_Left = function() {
	var b = board.create();

	b.getSquare('b', 1).piece = null;
	b.getSquare('c', 1).piece = null;
	b.getSquare('d', 1).piece = null;

	b.move(b.getSquare('e', 1), b.getSquare('c', 1));

	assert.ok(b.getSquare('d', 1).piece !== null);
	assert.ok(b.getSquare('a', 1).piece === null);
	assert.strictEqual(b.getSquare('d', 1).piece.type, piece.PieceType.Rook);
};

// validate simulated board.move undo for castle
module.exports.testBoard_MovePiece_KingCastle_Right_Undo = function() {
	var b = board.create(),
		r = null;

	b.getSquare('f', 8).piece = null;
	b.getSquare('g', 8).piece = null;

	r = b.move(b.getSquare('e', 8), b.getSquare('g', 8), true);

	assert.ok(b.getSquare('f', 8).piece !== null);
	assert.ok(b.getSquare('h', 8).piece === null);
	assert.strictEqual(b.getSquare('f', 8).piece.type, piece.PieceType.Rook);

	r.undo();

	assert.ok(b.getSquare('f', 8).piece === null);
	assert.ok(b.getSquare('h', 8).piece !== null);
	assert.strictEqual(b.getSquare('h', 8).piece.type, piece.PieceType.Rook);
};

// validate simulated board.move undo for castle
module.exports.testBoard_MovePiece_KingCastle_Left_Undo = function() {
	var b = board.create(),
		r = null;

	b.getSquare('b', 1).piece = null;
	b.getSquare('c', 1).piece = null;
	b.getSquare('d', 1).piece = null;

	r = b.move(b.getSquare('e', 1), b.getSquare('c', 1), true);

	assert.ok(b.getSquare('d', 1).piece !== null);
	assert.ok(b.getSquare('a', 1).piece === null);
	assert.strictEqual(b.getSquare('d', 1).piece.type, piece.PieceType.Rook);

	r.undo();

	assert.ok(b.getSquare('d', 1).piece === null);
	assert.ok(b.getSquare('a', 1).piece !== null);
	assert.strictEqual(b.getSquare('a', 1).piece.type, piece.PieceType.Rook);
};

// validate pawn capture works as expected
module.exports.testBoard_MovePiece_PawnCapture = function() {
	var b = board.create(),
		r = null;

	b.move('e2', 'e4');
	b.move('d7', 'd5');
	b.move('d2', 'd4');
	r = b.move('d5', 'e4');

	assert.strictEqual(b.getSquare('e4').piece.type, piece.PieceType.Pawn);
	assert.strictEqual(b.getSquare('d4').piece.type, piece.PieceType.Pawn);
	assert.ok(b.getSquare('d5').piece === null);
	assert.strictEqual(r.move.capturedPiece.type, piece.PieceType.Pawn);
};

// test pawn simulate move piece and no pieces disappear
module.exports.testBoard_Pawn_MoveUndo_PawnDisappears = function() {
	var b = board.create(),
		r = null;

	b.move('e2', 'e4');
	b.move('d7', 'd5');
	b.move('d2', 'd4');

	assert.strictEqual(b.getSquare('d4').piece.type, piece.PieceType.Pawn);

	r = b.move('d5', 'e4', true);

	assert.ok(b.getSquare('d4').piece !== null, 'pawn disappears during the move');

	r.undo();

	assert.ok(b.getSquare('d4').piece !== null, 'pawn disappears during the undo');
};