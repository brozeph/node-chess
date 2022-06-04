/**
	The Board is the representation of the current position of the pieces on
	the squares it contains.
*/
import { Piece, PieceType, SideType } from './piece.js';
import { EventEmitter } from 'events';
import { Square } from './square.js';

// types
export var NeighborType = {
	Above : { offset : 8 },
	AboveLeft : { offset : 7 },
	AboveRight : { offset : 9 },
	Below : { offset : -8 },
	BelowLeft : { offset : -9 },
	BelowRight : { offset : -7 },
	KnightAboveLeft : { offset : 15 },
	KnightAboveRight : { offset : 17 },
	KnightBelowLeft : { offset : -17 },
	KnightBelowRight : { offset : -15 },
	KnightLeftAbove : { offset : 6 },
	KnightLeftBelow : { offset : -10 },
	KnightRightAbove : { offset : 10 },
	KnightRightBelow : { offset : -6 },
	Left : { offset : -1 },
	Right : { offset : 1 }
};

// ctor
export class Board extends EventEmitter {
	constructor (squares) {
		super();

		this.squares = squares;
	}

	static create () {
		let
			b = new Board([]),
			f = 0,
			i = 0,
			r = 0,
			sq = null;

		/* eslint no-magic-numbers:0 */
		for (i = 0; i < 64; i++) {
			f = Math.floor(i % 8);
			r = Math.floor(i / 8) + 1;
			sq = Square.create('abcdefgh'[f], r);

			b.squares.push(sq);

			if (r === 1 || r === 8) { // Named pieces
				if (f === 0 || f === 7) { // Rookage
					sq.piece = Piece.createRook(
						r === 1 ? SideType.White : SideType.Black
					);
				} else if (f === 1 || f === 6) { // Knights
					sq.piece = Piece.createKnight(
						r === 1 ? SideType.White : SideType.Black
					);
				} else if (f === 2 || f === 5) { // Bish's
					sq.piece = Piece.createBishop(
						r === 1 ? SideType.White : SideType.Black
					);
				} else if (f === 3) {
					sq.piece = Piece.createQueen(
						r === 1 ? SideType.White : SideType.Black
					);
				} else {
					sq.piece = Piece.createKing(
						r === 1 ? SideType.White : SideType.Black
					);
				}
			} else if (r === 2 || r === 7) { // Pawns
				sq.piece = Piece.createPawn(
					r === 2 ? SideType.White : SideType.Black
				);
			}
		}

		return b;
	}

	static load (fen) {
		/* eslint sort-keys: 0 */
		const pieces = {
			b: { arg: SideType.Black, method: 'createBishop' },
			B: { arg: SideType.White, method: 'createBishop' },
			k: { arg: SideType.Black, method: 'createKing' },
			K: { arg: SideType.White, method: 'createKing' },
			n: { arg: SideType.Black, method: 'createKnight' },
			N: { arg: SideType.White, method: 'createKnight' },
			p: { arg: SideType.Black, method: 'createPawn' },
			P: { arg: SideType.White, method: 'createPawn' },
			q: { arg: SideType.Black, method: 'createQueen' },
			Q: { arg: SideType.White, method: 'createQueen' },
			r: { arg: SideType.Black, method: 'createRook' },
			R: { arg: SideType.White, method: 'createRook' }
		};

		const [board/* , turn, castling, enPassant, halfs, moves */] = fen.split(' ');
		const lines = board.split('/')
			.map((line, rank) => {
				const arr = line.split('');
				let file = 0;

				return arr.reduce((acc, cur) => {
					if (!isNaN(Number(cur))) {
						for (let i = 0; i < Number(cur); i += 1) {
							acc.push(Square.create('abcdefgh'[file], 8 - rank));
							file = file < 7 ? file + 1 : 0;
						}
					} else {
						const square = Square.create('abcdefgh'[file], 8 - rank);
						square.piece = Piece[pieces[cur].method](pieces[cur].arg);
						acc.push(square);
						file = file < 7 ? file + 1 : 0;
					}
					return acc;
				}, []);
			});

		return new Board(lines.reduce((acc, cur) => {
			acc.push(...cur);
			return acc;
		}, []));
	}

	getFen () {
		const fen = [];
		const squares = this.squares
			.reduce((acc, cur, idx) => {
				const outerIdx = parseInt(idx / 8, 10);
				acc[outerIdx] = acc[outerIdx] || [];
				acc[outerIdx].push(cur);
				return acc;
			}, [])
			.flatMap((row) => row.reverse())
			.reverse();

		for (let i = 0; i < squares.length; i += 1) {
			const square = squares[i];

			if (square.file === 'a' && square.rank < 8) {
				fen.push('/');
			}

			if (square.piece) {
				const transform = `to${square.piece.side.name === 'white' ? 'Upp' : 'Low'}erCase`;
				fen.push((square.piece.notation || 'p')[transform]());
			} else {
				if (isNaN(Number(fen[fen.length - 1]))) {
					fen.push(1);
				} else {
					fen[fen.length - 1] += 1;
				}
			}
		}

		return fen.join('');
	}

	getNeighborSquare (sq, n) {
		if (sq && n) {
			// validate boundaries of board
			if (sq.file === 'a' && (n === NeighborType.AboveLeft ||
					n === NeighborType.BelowLeft ||
					n === NeighborType.Left)) {
				return null;
			}

			if (sq.file === 'h' && (n === NeighborType.AboveRight ||
					n === NeighborType.BelowRight ||
					n === NeighborType.Right)) {
				return null;
			}

			if (sq.rank === 1 && (n === NeighborType.Below ||
					n === NeighborType.BelowLeft ||
					n === NeighborType.BelowRight)) {
				return null;
			}

			if (sq.rank === 8 && (n === NeighborType.Above ||
					n === NeighborType.AboveLeft ||
					n === NeighborType.AboveRight)) {
				return null;
			}

			// validate file
			let
				fIndex = 'abcdefgh'.indexOf(sq.file),
				i = 0;

			if (fIndex !== -1 && sq.rank > 0 && sq.rank < 9) {
				// find the index
				i = 8 * (sq.rank - 1) + fIndex + n.offset;
				if (this.squares && this.squares.length > i && i > -1) {
					return this.squares[i];
				}
			}
		}

		return null;
	}

	getSquare (f, r) {
		// check for shorthand
		if (typeof f === 'string' && f.length === 2 && !r) {
			r = parseInt(f.charAt(1), 10);
			f = f.charAt(0);
		}

		// validate file
		let
			fIndex = 'abcdefgh'.indexOf(f),
			i = 0;

		if (fIndex !== -1 && r > 0 && r < 9) {
			// Find the index
			i = 8 * (r - 1) + fIndex;
			if (this.squares && this.squares.length > i) {
				return this.squares[i];
			}
		}

		return null;
	}

	getSquares (side) {
		const list = [];

		for (let i = 0; i < this.squares.length; i++) {
			if (this.squares[i].piece && this.squares[i].piece.side === side) {
				list.push(this.squares[i]);
			}
		}

		return list;
	}

	move (src, dest, n) {
		if (typeof src === 'string' && src.length === 2) {
			src = this.getSquare(src);
		}

		if (typeof dest === 'string' && dest.length === 2) {
			dest = this.getSquare(dest);
		}

		let simulate;

		if (typeof n === 'boolean') {
			simulate = n;
			n = null;
		}

		if (src && src.file && src.rank && dest && dest.file && dest.rank) {
			let
				move = {
					algebraic : n,
					capturedPiece : dest.piece,
					castle : false,
					enPassant : false,
					postSquare : dest,
					prevSquare : src
				},
				p = src.piece,
				sq = null,
				undo = (b, m) => {
					return () => {
						if (!simulate) {
							// ensure no harm can be done if called multiple times
							if (m.undone) {
								throw new Error('cannot undo a move multiple times');
							}
						}

						// backout move by returning the squares to their state prior to the move
						m.prevSquare.piece = m.postSquare.piece;
						m.postSquare.piece = m.capturedPiece;

						// handle standard scenario
						if (!m.enPassant) {
							m.postSquare.piece = m.capturedPiece;
						}

						// handle en-passant scenario
						if (m.enPassant) {
							b.getSquare(
								m.postSquare.file,
								m.prevSquare.rank
							).piece = m.capturedPiece;

							// there is no piece on the post square in the event of
							// an en-passant, clear anything that me be present as
							// a result of the move (fix for issue #8)
							m.postSquare.piece = null;
						}

						// handle castle scenario
						if (m.castle) {
							sq = b.getSquare(
								move.postSquare.file === 'g' ? 'f' : 'd',
								move.postSquare.rank);
								
							b.getSquare(
								move.postSquare.file === 'g' ? 'h' : 'a',
								move.postSquare.rank
							).piece = sq.piece;
							sq.piece = null;
						}

						// if not a simulation, reset the move count
						if (!simulate) {
							// correct the moveCount for the piece
							m.prevSquare.piece.moveCount = m.prevSquare.piece.moveCount - 1;

							// indicate move has been undone
							m.undone = true;

							// emit an undo event
							b.emit('undo', m);
						}
					};
				};

			dest.piece = p;
			move.castle = p.type === PieceType.King &&
				p.moveCount === 0 &&
				(move.postSquare.file === 'g' || move.postSquare.file === 'c');
			move.enPassant = p.type === PieceType.Pawn &&
				move.capturedPiece === null &&
				move.postSquare.file !== move.prevSquare.file;
			move.prevSquare.piece = null;

			// check for en-passant
			if (move.enPassant) {
				sq = this.getSquare(move.postSquare.file, move.prevSquare.rank);
				move.capturedPiece = sq.piece;
				sq.piece = null;
			}

			// check for castle
			if (move.castle) {
				sq = this.getSquare(
					move.postSquare.file === 'g' ? 'h' : 'a',
					move.postSquare.rank
				);

				if (sq.piece === null) {
					move.castle = false;
				} else {
					this.getSquare(
						move.postSquare.file === 'g' ? 'f' : 'd',
						move.postSquare.rank
					).piece = sq.piece;
					sq.piece = null;
				}
			}

			if (!simulate) {
				p.moveCount++;
				this.lastMovedPiece = p;

				if (move.capturedPiece) {
					this.emit('capture', move);
				}

				if (move.castle) {
					this.emit('castle', move);
				}

				if (move.enPassant) {
					this.emit('enPassant', move);
				}

				this.emit('move', move);
			}

			return {
				move,
				undo : undo(this, move)
			};
		}
	}

	promote (sq, p) {
		// update move count and last piece
		p.moveCount = sq.piece.moveCount;
		this.lastMovedPiece = p;

		// set to square
		sq.piece = p;

		this.emit('promote', sq);

		return sq;
	}
}

// exports
export default { Board, NeighborType };
