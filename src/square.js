/**
	The simple definition of a rank & file within a board.

	Additionally, if a Piece occupies a square on a board, the
	square contains the reference to the piece.
*/

export class Square {
	constructor (file, rank) {
		this.file = file;
		this.piece = null;
		this.rank = rank;
	}

	static create (file, rank) {
		return new Square(file, rank);
	}
}

export default { Square };
