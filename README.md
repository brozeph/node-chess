# node-chess - algebraic chess engine
node-chess is an algebraic notation driven chess engine that can validate board position and produce a list of viable moves (notated).

[![Build Status](https://secure.travis-ci.org/brozeph/node-chess.png?branch=master)](http://travis-ci.org/brozeph/node-chess?branch=master)

## Features
* Accepts moves in algebraic notation
* Lists valid moves in algebraic notation
* Fuzzy algebraic notation parsing
* En Passant validation
* 3-fold repetition detection
* Stalemate detection
* Check detection
* Checkmate detection
* Undo moves easily
* Easily readable object structure
* High unit test coverage

## Installation
	npm install chess

## Public API

### Create a new game
	var chess = require('chess');

	// create a game client
	var gc = chess.create(),
	    m = null,
	    status = null;

	// look at the valid moves
	status = gc.getStatus();

	// make a move
	m = gc.move('a4');

	// look at the status again after the move to see
	// the opposing side's available moves
	status = gc.getStatus();

#### chess.move() Function
From the above example, the response object that is returned when calling chess.move() looks like the following:

	{ move :
		{	capturedPiece : null, // the captured piece (if capture occurred)
			castle : false, // was the move a castle?
			enPassant : false, // was the move en passant?
			postSquare : { file: 'a', rank: 4, piece: {
				moveCount: 1,
				side: { name: 'white' },
				type: 'pawn',
				notation: 'R'
			} },
			prevSquare : { file: 'a', rank: 2, piece: null } },
	  undo : __function__ } // undo() can be used to back out the previous move

##### move Object
The move object contains a collection of properties and an undo function pointer. The five properties of the move object are:

* capturedPiece - If a piece was captured during the move, it will be represented here.
* castle - If the move was a castle, this will be set to true, otherwise false.
* enPassant - If the move was en passant, this will be set to true, otherwise false.
* postSquare - The destination square object for the move.
* prevSquare - The square object from which the move was originated.

##### undo() Function
To back out the move:

	m.undo();

#### chess.getStatus() Function
The status object is as follows (abbreviated in parts to improve readability):

	{ board: // this is the top level board
		{ squares: // an array of all squares on the board
			[ { file: 'a', rank: 1, piece: { // the file, rank and piece on the square
				moveCount: 0,
				side: { name: 'white' },
				type: 'rook',
				notation: 'R'
			} },
			/* the rest of the squares... */
			]},
	   isCheck: false, // is the King currently in check?
	   isCheckmate: false, // is the King currently in checkmate?
	   isRepetition: false, // has 3-fold repetition occurred?
	   isStalemate: false, // is the board in stalemate?
	   notatedMoves: // all possible moves (notated) with details for each move
	     { a3: 
		    { src:
			   { file: 'a'
			     rank: 2,
			     piece:
			      { moveCount: 0,
				    side: {name: 'white' },
				    type: 'pawn',
				    notation: 'R' } },
			  dest: { file: 'a', rank: 3, piece: null } },
			/* the rest of the available moves... */
		  }
	}

##### status
The status object returned via the getStatus() function call contains several Object properties:

* board - The underlying board Object which contains the collection of squares.
* isCheck - If the status of the board is check, this will be true.
* isCheckmate - If the status of the board is checkmate, this will be true. Additionally, the notatedMoves property will be empty.
* isRepetition - If 3-fold repetition has occurred, this will be true. The notatedMoves property will not be empty as the game can technically continue.
* isStalemate - If the board is in stalemate, this will be set to true.
* notatedMoves - A hash containing all available moves on the board.

##### status.notatedMoves
Each object within the notatedMoves hash represents a possible move. The key to the hash is the algebraic notation of the move. The value for each key in the hash has two properties:

* src - The starting square (which contains a piece) of the move
* dest - The destination square of the move

The following code is an example of how to iterate the available notated moves for the game.

	var gc = chess.create(),
		i = 0,
		key = '',
		status = gc.getStatus();
	
	for (i = 0; i < Object.keys(status.notatedMoves).length; i++) {
		key = Object.keys(status.notatedMoves)[i];

		console.log(status.notatedMoves[key]);
	}

#### Example usage
The following usage of the code is playing out the 3rd game in the series between Fischer and Petrosian in Buenos Aires, 1971. The game ended a draw due to 3 fold repetition.

	var chess = require('chess'),
		util = require('util');

	var gc = chess.create();

	// 1. e4 e6
	gc.move('e4');
	gc.move('e6');
	// 2. d4 d5
	gc.move('d4');
	gc.move('d5');
	// 3. Nc3 Nf6
	gc.move('Nc3');
	gc.move('Nf6');
	// 4. Bg5 dxe4
	gc.move('Bg5');
	gc.move('dxe4');
	// 5. Nxe4 Be7
	gc.move('Nxe4');
	gc.move('Be7');
	// 6. Bxf6 gxf6
	gc.move('Bxf6');
	gc.move('gxf6');
	// 7. g3 f5
	gc.move('g3');	
	gc.move('f5'); 
	// 8. Nc3 Bf6
	gc.move('Nc3');
	gc.move('Bf6'); 
	// 9. Nge2 Nc6
	gc.move('Nge2');
	gc.move('Nc6');
	// 10. d5 exd5
	gc.move('d5');
	gc.move('exd5'); 
	// 11. Nxd5 Bxb2
	gc.move('Nxd5');
	gc.move('Bxb2');
	// 12. Bg2 O-O
	gc.move('Bg2');
	gc.move('0-0'); 
	// 13. O-O Bh8
	gc.move('0-0');
	gc.move('Bh8'); 
	// 14. Nef4 Ne5
	gc.move('Nef4');
	gc.move('Ne5'); 
	// 15. Qh5 Ng6
	gc.move('Qh5');
	gc.move('Ng6'); 
	// 16. Rad1 c6
	gc.move('Rad1');
	gc.move('c6');
	// 17. Ne3 Qf6
	gc.move('Ne3');
	gc.move('Qf6'); 
	// 18. Kh1 Bg7
	gc.move('Kh1');
	gc.move('Bg7'); 
	// 19. Bh3 Ne7
	gc.move('Bh3');
	gc.move('Ne7'); 
	// 20. Rd3 Be6
	gc.move('Rd3');
	gc.move('Be6');
	// 21. Rfd1 Bh6
	gc.move('Rfd1');
	gc.move('Bh6');
	// 22. Rd4 Bxf4
	gc.move('Rd4');
	gc.move('Bxf4'); 
	// 23. Rxf4 Rad8
	gc.move('Rxf4');
	gc.move('Rad8'); 
	// 24. Rxd8 Rxd8
	gc.move('Rxd8');
	gc.move('Rxd8'); 
	// 25. Bxf5 Nxf5
	gc.move('Bxf5');
	gc.move('Nxf5');
	// 26. Nxf5 Rd5
	gc.move('Nxf5');
	gc.move('Rd5'); 
	// 27. g4 Bxf5
	gc.move('g4');
	gc.move('Bxf5'); 
	// 28. gxf5 h6
	gc.move('gxf5');
	gc.move('h6'); 
	// 29. h3 Kh7
	gc.move('h3');
	gc.move('Kh7'); 
	// 30. Qe2 Qe5
	gc.move('Qe2');
	gc.move('Qe5');
	// 31. Qh5 Qf6
	gc.move('Qh5');
	gc.move('Qf6'); 
	// 32. Qe2 Re5
	gc.move('Qe2');
	gc.move('Re5'); 
	// 33. Qd3 Rd5
	gc.move('Qd3');
	gc.move('Rd5'); 
	// 34. Qe2
	gc.move('Qe2');

	console.log(util.inspect(gc.getStatus(), false, 7));

##### Output
The above code produces the following output:

	{ board: 
	   { squares: 
	      [ { file: 'a', rank: 1, piece: null },
	        { file: 'b', rank: 1, piece: null },
	        { file: 'c', rank: 1, piece: null },
	        { file: 'd', rank: 1, piece: null },
	        { file: 'e', rank: 1, piece: null },
	        { file: 'f', rank: 1, piece: null },
	        { file: 'g', rank: 1, piece: null },
	        { file: 'h',
	          rank: 1,
	          piece: 
	           { moveCount: 2,
	             side: { name: 'white' },
	             type: 'king',
	             notation: 'K' } },
	        { file: 'a',
	          rank: 2,
	          piece: 
	           { moveCount: 0,
	             side: { name: 'white' },
	             type: 'pawn',
	             notation: '' } },
	        { file: 'b', rank: 2, piece: null },
	        { file: 'c',
	          rank: 2,
	          piece: 
	           { moveCount: 0,
	             side: { name: 'white' },
	             type: 'pawn',
	             notation: '' } },
	        { file: 'd', rank: 2, piece: null },
	        { file: 'e',
	          rank: 2,
	          piece: 
	           { moveCount: 6,
	             side: { name: 'white' },
	             type: 'queen',
	             notation: 'Q' } },
	        { file: 'f',
	          rank: 2,
	          piece: 
	           { moveCount: 0,
	             side: { name: 'white' },
	             type: 'pawn',
	             notation: '' } },
	        { file: 'g', rank: 2, piece: null },
	        { file: 'h', rank: 2, piece: null },
	        { file: 'a', rank: 3, piece: null },
	        { file: 'b', rank: 3, piece: null },
	        { file: 'c', rank: 3, piece: null },
	        { file: 'd', rank: 3, piece: null },
	        { file: 'e', rank: 3, piece: null },
	        { file: 'f', rank: 3, piece: null },
	        { file: 'g', rank: 3, piece: null },
	        { file: 'h',
	          rank: 3,
	          piece: 
	           { moveCount: 1,
	             side: { name: 'white' },
	             type: 'pawn',
	             notation: '' } },
	        { file: 'a', rank: 4, piece: null },
	        { file: 'b', rank: 4, piece: null },
	        { file: 'c', rank: 4, piece: null },
	        { file: 'd', rank: 4, piece: null },
	        { file: 'e', rank: 4, piece: null },
	        { file: 'f',
	          rank: 4,
	          piece: 
	           { moveCount: 4,
	             side: { name: 'white' },
	             type: 'rook',
	             notation: 'R' } },
	        { file: 'g', rank: 4, piece: null },
	        { file: 'h', rank: 4, piece: null },
	        { file: 'a', rank: 5, piece: null },
	        { file: 'b', rank: 5, piece: null },
	        { file: 'c', rank: 5, piece: null },
	        { file: 'd',
	          rank: 5,
	          piece: 
	           { moveCount: 4,
	             side: { name: 'black' },
	             type: 'rook',
	             notation: 'R' } },
	        { file: 'e', rank: 5, piece: null },
	        { file: 'f',
	          rank: 5,
	          piece: 
	           { moveCount: 3,
	             side: { name: 'white' },
	             type: 'pawn',
	             notation: '' } },
	        { file: 'g', rank: 5, piece: null },
	        { file: 'h', rank: 5, piece: null },
	        { file: 'a', rank: 6, piece: null },
	        { file: 'b', rank: 6, piece: null },
	        { file: 'c',
	          rank: 6,
	          piece: 
	           { moveCount: 1,
	             side: { name: 'black' },
	             type: 'pawn',
	             notation: '' } },
	        { file: 'd', rank: 6, piece: null },
	        { file: 'e', rank: 6, piece: null },
	        { file: 'f',
	          rank: 6,
	          piece: 
	           { moveCount: 3,
	             side: { name: 'black' },
	             type: 'queen',
	             notation: 'Q' } },
	        { file: 'g', rank: 6, piece: null },
	        { file: 'h',
	          rank: 6,
	          piece: 
	           { moveCount: 1,
	             side: { name: 'black' },
	             type: 'pawn',
	             notation: '' } },
	        { file: 'a',
	          rank: 7,
	          piece: 
	           { moveCount: 0,
	             side: { name: 'black' },
	             type: 'pawn',
	             notation: '' } },
	        { file: 'b',
	          rank: 7,
	          piece: 
	           { moveCount: 0,
	             side: { name: 'black' },
	             type: 'pawn',
	             notation: '' } },
	        { file: 'c', rank: 7, piece: null },
	        { file: 'd', rank: 7, piece: null },
	        { file: 'e', rank: 7, piece: null },
	        { file: 'f',
	          rank: 7,
	          piece: 
	           { moveCount: 0,
	             side: { name: 'black' },
	             type: 'pawn',
	             notation: '' } },
	        { file: 'g', rank: 7, piece: null },
	        { file: 'h',
	          rank: 7,
	          piece: 
	           { moveCount: 2,
	             side: { name: 'black' },
	             type: 'king',
	             notation: 'K' } },
	        { file: 'a', rank: 8, piece: null },
	        { file: 'b', rank: 8, piece: null },
	        { file: 'c', rank: 8, piece: null },
	        { file: 'd', rank: 8, piece: null },
	        { file: 'e', rank: 8, piece: null },
	        { file: 'f', rank: 8, piece: null },
	        { file: 'g', rank: 8, piece: null },
	        { file: 'h', rank: 8, piece: null } ],
	     _events: { move: [Function] } },
	  isCheck: false,
	  isCheckmate: false,
	  isRepetition: true,
	  isStalemate: false,
	  notatedMoves: 
	   { Rd4: 
	      { src: 
	         { file: 'd',
	           rank: 5,
	           piece: 
	            { moveCount: 4,
	              side: { name: 'black' },
	              type: 'rook',
	              notation: 'R' } },
	        dest: { file: 'd', rank: 4, piece: null } },
	     Rd3: 
	      { src: 
	         { file: 'd',
	           rank: 5,
	           piece: 
	            { moveCount: 4,
	              side: { name: 'black' },
	              type: 'rook',
	              notation: 'R' } },
	        dest: { file: 'd', rank: 3, piece: null } },
	     Rd2: 
	      { src: 
	         { file: 'd',
	           rank: 5,
	           piece: 
	            { moveCount: 4,
	              side: { name: 'black' },
	              type: 'rook',
	              notation: 'R' } },
	        dest: { file: 'd', rank: 2, piece: null } },
	     Rd1: 
	      { src: 
	         { file: 'd',
	           rank: 5,
	           piece: 
	            { moveCount: 4,
	              side: { name: 'black' },
	              type: 'rook',
	              notation: 'R' } },
	        dest: { file: 'd', rank: 1, piece: null } },
	     Rd6: 
	      { src: 
	         { file: 'd',
	           rank: 5,
	           piece: 
	            { moveCount: 4,
	              side: { name: 'black' },
	              type: 'rook',
	              notation: 'R' } },
	        dest: { file: 'd', rank: 6, piece: null } },
	     Rd7: 
	      { src: 
	         { file: 'd',
	           rank: 5,
	           piece: 
	            { moveCount: 4,
	              side: { name: 'black' },
	              type: 'rook',
	              notation: 'R' } },
	        dest: { file: 'd', rank: 7, piece: null } },
	     Rd8: 
	      { src: 
	         { file: 'd',
	           rank: 5,
	           piece: 
	            { moveCount: 4,
	              side: { name: 'black' },
	              type: 'rook',
	              notation: 'R' } },
	        dest: { file: 'd', rank: 8, piece: null } },
	     Rc5: 
	      { src: 
	         { file: 'd',
	           rank: 5,
	           piece: 
	            { moveCount: 4,
	              side: { name: 'black' },
	              type: 'rook',
	              notation: 'R' } },
	        dest: { file: 'c', rank: 5, piece: null } },
	     Rb5: 
	      { src: 
	         { file: 'd',
	           rank: 5,
	           piece: 
	            { moveCount: 4,
	              side: { name: 'black' },
	              type: 'rook',
	              notation: 'R' } },
	        dest: { file: 'b', rank: 5, piece: null } },
	     Ra5: 
	      { src: 
	         { file: 'd',
	           rank: 5,
	           piece: 
	            { moveCount: 4,
	              side: { name: 'black' },
	              type: 'rook',
	              notation: 'R' } },
	        dest: { file: 'a', rank: 5, piece: null } },
	     Re5: 
	      { src: 
	         { file: 'd',
	           rank: 5,
	           piece: 
	            { moveCount: 4,
	              side: { name: 'black' },
	              type: 'rook',
	              notation: 'R' } },
	        dest: { file: 'e', rank: 5, piece: null } },
	     Rxf5: 
	      { src: 
	         { file: 'd',
	           rank: 5,
	           piece: 
	            { moveCount: 4,
	              side: { name: 'black' },
	              type: 'rook',
	              notation: 'R' } },
	        dest: 
	         { file: 'f',
	           rank: 5,
	           piece: 
	            { moveCount: 3,
	              side: { name: 'white' },
	              type: 'pawn',
	              notation: '' } } },
	     c5: 
	      { src: 
	         { file: 'c',
	           rank: 6,
	           piece: 
	            { moveCount: 1,
	              side: { name: 'black' },
	              type: 'pawn',
	              notation: '' } },
	        dest: { file: 'c', rank: 5, piece: null } },
	     Qxf5: 
	      { src: 
	         { file: 'f',
	           rank: 6,
	           piece: 
	            { moveCount: 3,
	              side: { name: 'black' },
	              type: 'queen',
	              notation: 'Q' } },
	        dest: 
	         { file: 'f',
	           rank: 5,
	           piece: 
	            { moveCount: 3,
	              side: { name: 'white' },
	              type: 'pawn',
	              notation: '' } } },
	     Qe6: 
	      { src: 
	         { file: 'f',
	           rank: 6,
	           piece: 
	            { moveCount: 3,
	              side: { name: 'black' },
	              type: 'queen',
	              notation: 'Q' } },
	        dest: { file: 'e', rank: 6, piece: null } },
	     Qd6: 
	      { src: 
	         { file: 'f',
	           rank: 6,
	           piece: 
	            { moveCount: 3,
	              side: { name: 'black' },
	              type: 'queen',
	              notation: 'Q' } },
	        dest: { file: 'd', rank: 6, piece: null } },
	     Qg6: 
	      { src: 
	         { file: 'f',
	           rank: 6,
	           piece: 
	            { moveCount: 3,
	              side: { name: 'black' },
	              type: 'queen',
	              notation: 'Q' } },
	        dest: { file: 'g', rank: 6, piece: null } },
	     Qe7: 
	      { src: 
	         { file: 'f',
	           rank: 6,
	           piece: 
	            { moveCount: 3,
	              side: { name: 'black' },
	              type: 'queen',
	              notation: 'Q' } },
	        dest: { file: 'e', rank: 7, piece: null } },
	     Qd8: 
	      { src: 
	         { file: 'f',
	           rank: 6,
	           piece: 
	            { moveCount: 3,
	              side: { name: 'black' },
	              type: 'queen',
	              notation: 'Q' } },
	        dest: { file: 'd', rank: 8, piece: null } },
	     Qg5: 
	      { src: 
	         { file: 'f',
	           rank: 6,
	           piece: 
	            { moveCount: 3,
	              side: { name: 'black' },
	              type: 'queen',
	              notation: 'Q' } },
	        dest: { file: 'g', rank: 5, piece: null } },
	     Qh4: 
	      { src: 
	         { file: 'f',
	           rank: 6,
	           piece: 
	            { moveCount: 3,
	              side: { name: 'black' },
	              type: 'queen',
	              notation: 'Q' } },
	        dest: { file: 'h', rank: 4, piece: null } },
	     Qe5: 
	      { src: 
	         { file: 'f',
	           rank: 6,
	           piece: 
	            { moveCount: 3,
	              side: { name: 'black' },
	              type: 'queen',
	              notation: 'Q' } },
	        dest: { file: 'e', rank: 5, piece: null } },
	     Qd4: 
	      { src: 
	         { file: 'f',
	           rank: 6,
	           piece: 
	            { moveCount: 3,
	              side: { name: 'black' },
	              type: 'queen',
	              notation: 'Q' } },
	        dest: { file: 'd', rank: 4, piece: null } },
	     Qc3: 
	      { src: 
	         { file: 'f',
	           rank: 6,
	           piece: 
	            { moveCount: 3,
	              side: { name: 'black' },
	              type: 'queen',
	              notation: 'Q' } },
	        dest: { file: 'c', rank: 3, piece: null } },
	     Qb2: 
	      { src: 
	         { file: 'f',
	           rank: 6,
	           piece: 
	            { moveCount: 3,
	              side: { name: 'black' },
	              type: 'queen',
	              notation: 'Q' } },
	        dest: { file: 'b', rank: 2, piece: null } },
	     Qa1: 
	      { src: 
	         { file: 'f',
	           rank: 6,
	           piece: 
	            { moveCount: 3,
	              side: { name: 'black' },
	              type: 'queen',
	              notation: 'Q' } },
	        dest: { file: 'a', rank: 1, piece: null } },
	     Qg7: 
	      { src: 
	         { file: 'f',
	           rank: 6,
	           piece: 
	            { moveCount: 3,
	              side: { name: 'black' },
	              type: 'queen',
	              notation: 'Q' } },
	        dest: { file: 'g', rank: 7, piece: null } },
	     Qh8: 
	      { src: 
	         { file: 'f',
	           rank: 6,
	           piece: 
	            { moveCount: 3,
	              side: { name: 'black' },
	              type: 'queen',
	              notation: 'Q' } },
	        dest: { file: 'h', rank: 8, piece: null } },
	     h5: 
	      { src: 
	         { file: 'h',
	           rank: 6,
	           piece: 
	            { moveCount: 1,
	              side: { name: 'black' },
	              type: 'pawn',
	              notation: '' } },
	        dest: { file: 'h', rank: 5, piece: null } },
	     a6: 
	      { src: 
	         { file: 'a',
	           rank: 7,
	           piece: 
	            { moveCount: 0,
	              side: { name: 'black' },
	              type: 'pawn',
	              notation: '' } },
	        dest: { file: 'a', rank: 6, piece: null } },
	     a5: 
	      { src: 
	         { file: 'a',
	           rank: 7,
	           piece: 
	            { moveCount: 0,
	              side: { name: 'black' },
	              type: 'pawn',
	              notation: '' } },
	        dest: { file: 'a', rank: 5, piece: null } },
	     b6: 
	      { src: 
	         { file: 'b',
	           rank: 7,
	           piece: 
	            { moveCount: 0,
	              side: { name: 'black' },
	              type: 'pawn',
	              notation: '' } },
	        dest: { file: 'b', rank: 6, piece: null } },
	     b5: 
	      { src: 
	         { file: 'b',
	           rank: 7,
	           piece: 
	            { moveCount: 0,
	              side: { name: 'black' },
	              type: 'pawn',
	              notation: '' } },
	        dest: { file: 'b', rank: 5, piece: null } },
	     Kh8: 
	      { src: 
	         { file: 'h',
	           rank: 7,
	           piece: 
	            { moveCount: 2,
	              side: { name: 'black' },
	              type: 'king',
	              notation: 'K' } },
	        dest: { file: 'h', rank: 8, piece: null } },
	     Kg7: 
	      { src: 
	         { file: 'h',
	           rank: 7,
	           piece: 
	            { moveCount: 2,
	              side: { name: 'black' },
	              type: 'king',
	              notation: 'K' } },
	        dest: { file: 'g', rank: 7, piece: null } },
	     Kg8: 
	      { src: 
	         { file: 'h',
	           rank: 7,
	           piece: 
	            { moveCount: 2,
	              side: { name: 'black' },
	              type: 'king',
	              notation: 'K' } },
	        dest: { file: 'g', rank: 8, piece: null } } } }
