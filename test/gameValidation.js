var assert = require('assert'),
	piece = require('../lib/piece.js'),
	board = require('../lib/board.js'),
	game = require('../lib/game.js'),
	gameValidation = require('../lib/gameValidation.js');

describe('GameValidation', function() {

	// validate check
	it('should properly indicate check', function() {
		var g = game.create(),
			b = g.board,
			v = gameValidation.create(g);

		// put king into checkmate
		b.move(b.getSquare('d', 2), b.getSquare('d', 4));
		b.move(b.getSquare('e', 7), b.getSquare('e', 5));
		b.move(b.getSquare('d', 4), b.getSquare('e', 5));
		b.move(b.getSquare('f', 8), b.getSquare('b', 4));

		v.start(function(err, result) {
			assert.strictEqual(result.isCheck, true);
			assert.strictEqual(result.isCheckmate, false);
			assert.strictEqual(result.isRepetition, false);
			assert.strictEqual(result.isStalemate, false);
		});
	});

	// validate checkmate
	it('should properly indicate checkmate', function() {
		var g = game.create(),
			b = g.board,
			v = gameValidation.create(g);

		// put king into checkmate
		b.move(b.getSquare('e', 2), b.getSquare('e', 4));
		b.move(b.getSquare('f', 7), b.getSquare('f', 6));
		b.move(b.getSquare('d', 2), b.getSquare('d', 4));
		b.move(b.getSquare('g', 7), b.getSquare('g', 5));
		b.move(b.getSquare('d', 1), b.getSquare('h', 5));

		v.start(function(err, result) {
			assert.strictEqual(result.validMoves.length, 0);
			assert.strictEqual(result.isCheck, false);
			assert.strictEqual(result.isCheckmate, true);
			assert.strictEqual(result.isRepetition, false);
			assert.strictEqual(result.isStalemate, false);
		});
	});

	// validate stalemate
	it('should properly indicate stalemate', function() {
		var g = game.create(),
			b = g.board,
			v = gameValidation.create(g);

		// remove several pieces from the board
		b.getSquare('a1').piece = null;
		b.getSquare('b1').piece = null;
		b.getSquare('c1').piece = null;
		b.getSquare('d1').piece = null;
		b.getSquare('f1').piece = null;
		b.getSquare('g1').piece = null;
		b.getSquare('h1').piece = null;
		b.getSquare('a2').piece = null;
		b.getSquare('b2').piece = null;
		b.getSquare('c2').piece = null;
		b.getSquare('d2').piece = null;
		b.getSquare('f2').piece = null;
		b.getSquare('g2').piece = null;
		b.getSquare('h2').piece = null;
		b.getSquare('a8').piece = null;
		b.getSquare('b8').piece = null;
		b.getSquare('c8').piece = null;
		b.getSquare('d8').piece = null;
		b.getSquare('f8').piece = null;
		b.getSquare('g8').piece = null;
		b.getSquare('h8').piece = null;
		b.getSquare('a7').piece = null;
		b.getSquare('b7').piece = null;
		b.getSquare('c7').piece = null;
		b.getSquare('d7').piece = null;
		b.getSquare('e7').piece = null;
		b.getSquare('f7').piece = null;
		b.getSquare('g7').piece = null;
		b.getSquare('h7').piece = null;

		// put black king in stalemate
		b.move('e1', 'e6', true);
		b.move('e2', 'e7');

		v.start(function(err, result) {
			assert.strictEqual(result.validMoves.length, 0);
			assert.strictEqual(result.isCheck, false);
			assert.strictEqual(result.isCheckmate, false);
			assert.strictEqual(result.isRepetition, false);
			assert.strictEqual(result.isStalemate, true);
		});
	});

	// validate threefold repetition rule
	// Fischer vs Petrosian, Buenos Aires, 1971, round 3
	it('should properly indicate 3-fold repetition', function() {
		var g = game.create(),
			b = g.board,
			v = gameValidation.create(g);

		// 1. e4 e6
		b.move('e2', 'e4');
		b.move('e7', 'e6');
		// 2. d4 d5
		b.move('d2', 'd4');
		b.move('d7', 'd5');
		// 3. Nc3 Nf6
		b.move('b1', 'c3');
		b.move('g8', 'f6');
		// 4. Bg5 dxe4
		b.move('c1', 'g5');
		b.move('d5', 'e4');
		// 5. Nxe4 Be7
		b.move('c3', 'e4');
		b.move('f8', 'e7');
		// 6. Bxf6 gxf6
		b.move('g5', 'f6');
		b.move('g7', 'f6');
		// 7. g3 f5
		b.move('g2', 'g3');
		b.move('f6', 'f5'); 
		// 8. Nc3 Bf6
		b.move('e4', 'c3');
		b.move('e7', 'f6'); 
		// 9. Nge2 Nc6
		b.move('g1', 'e2');
		b.move('b8', 'c6');
		// 10. d5 exd5
		b.move('d4', 'd5');
		b.move('e6', 'd5'); 
		// 11. Nxd5 Bxb2
		b.move('c3', 'd5');
		b.move('f6', 'b2');
		// 12. Bg2 O-O
		b.move('f1', 'g2');
		b.move('e8', 'g8'); 
		// 13. O-O Bh8
		b.move('e1', 'g1');
		b.move('b2', 'h8'); 
		// 14. Nef4 Ne5
		b.move('e2', 'f4');
		b.move('c6', 'e5'); 
		// 15. Qh5 Ng6
		b.move('d1', 'h5');
		b.move('e5', 'g6'); 
		// 16. Rad1 c6
		b.move('a1', 'd1');
		b.move('c7', 'c6');
		// 17. Ne3 Qf6
		b.move('d5', 'e3');
		b.move('d8', 'f6'); 
		// 18. Kh1 Bg7
		b.move('g1', 'h1');
		b.move('h8', 'g7'); 
		// 19. Bh3 Ne7
		b.move('g2', 'h3');
		b.move('g6', 'e7'); 
		// 20. Rd3 Be6
		b.move('d1', 'd3');
		b.move('c8', 'e6'); 
		// 21. Rfd1 Bh6
		b.move('f1', 'd1');
		b.move('g7', 'h6');
		// 22. Rd4 Bxf4
		b.move('d3', 'd4');
		b.move('h6', 'f4'); 
		// 23. Rxf4 Rad8
		b.move('d4', 'f4');
		b.move('a8', 'd8'); 
		// 24. Rxd8 Rxd8
		b.move('d1', 'd8');
		b.move('f8', 'd8'); 
		// 25. Bxf5 Nxf5
		b.move('h3', 'f5');
		b.move('e7', 'f5');
		// 26. Nxf5 Rd5
		b.move('e3', 'f5');
		b.move('d8', 'd5'); 
		// 27. g4 Bxf5
		b.move('g3', 'g4');
		b.move('e6', 'f5'); 
		// 28. gxf5 h6
		b.move('g4', 'f5');
		b.move('h7', 'h6'); 
		// 29. h3 Kh7
		b.move('h2', 'h3');
		b.move('g8', 'h7'); 
		// 30. Qe2 Qe5
		b.move('h5', 'e2');
		b.move('f6', 'e5');
		// 31. Qh5 Qf6
		b.move('e2', 'h5');
		b.move('e5', 'f6'); 
		// 32. Qe2 Re5
		b.move('h5', 'e2');
		b.move('d5', 'e5'); 
		// 33. Qd3 Rd5
		b.move('e2', 'd3');
		b.move('e5', 'd5'); 
		// 34. Qe2
		b.move('d3', 'e2');

		v.start(function(err, result) {
			assert.ok(result.validMoves.length > 0);
			assert.strictEqual(result.isCheck, false);
			assert.strictEqual(result.isCheckmate, false);
			assert.strictEqual(result.isRepetition, true);
			assert.strictEqual(result.isStalemate, false);
		});
	});
});