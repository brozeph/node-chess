// Typescript Declaration File for Node Chess module
// https://www.npmjs.com/package/chess

declare namespace Chess {
  export function create(opts?: { PGN: boolean }): AlgebraicGameClient
  export function createSimple(): SimpleGameClient

  interface AlgebraicGameClient {
    /** The Game object, which includes the board and move history. */
    game: Game
    /** Whether either of the side is under check */
    isCheck: boolean
    /** Whether either of the side is checkmated */
    isCheckMate: boolean
    /** Whether game has ended by threefold repetition */
    isRepetition: boolean
    /** Whether game has ended by stalemate */
    isStalemate: boolean
    /** Hash of next possible moves with key as notation and value as src-dest mapping */
    notatedMoves: Record<string, NotatedMove>
    /** Whether notation is safe for PGN or not */
    PGN: boolean
    /** An array of pieces (src) which can move to the different squares. */
    validMoves: ValidMove[]
    /** Game Validation Object */
    validation: GameValidation
    /** Add event listeners */
    on(event: ChessEvent, cbk: () => void): void
    /**
     * Make a move on the board
     * @param notation Notation of move in PGN format
     */
    move(notation: string): PlayedMove
    getStatus(): AlgebraicGameStatus
	}

  interface SimpleGameClient {
    /** Whether either of the side is under check */
    isCheck: boolean
    /** Whether either of the side is checkmated */
    isCheckMate: boolean
    /** Whether game has ended by threefold repetition */
    isRepetition: boolean
    /** Whether game has ended by stalemate */
    isStalemate: boolean
    /** The Game Object, which includes the board and move history. */
    game: Game
    /** An array of pieces (src) which can move to the different squares. */
    validMoves: ValidMove[]
    /** Game Validation Object */
    validation: GameValidation
    /** Add event listeners */
    on(event: ChessEvent, cbk: () => void): void
    /**
     * Make a move on the board
     * @param notation Notation of move in PGN format
     */
    move(notation: string): PlayedMove
    getStatus(): SimpleGameStatus
	}

  interface AlgebraicGameStatus {
    /** Current board configuration */
    board: ChessBoard
    /** Whether either of the side is under check */
    isCheck: boolean
    /** Whether either of the side is checkmated */
    isCheckMate: boolean
    /** Whether game has ended by threefold repetition */
    isRepetition: boolean
    /** Whether game has ended by stalemate */
    isStalemate: boolean
    /** Hash of next possible moves with key as notation and value as src-dest mapping */
    notatedMoves: Record<string, NotatedMove>
	}

  interface SimpleGameStatus {
    /** Current board configuration */
    board: ChessBoard
    /** Whether either of the side is under check */
    isCheck: boolean
    /** Whether either of the side is checkmated */
    isCheckMate: boolean
    /** Whether game has ended by threefold repetition */
    isRepetition: boolean
    /** Whether game has ended by stalemate */
    isStalemate: boolean
	}

  type File = string
  type Rank = number
	type ChessEvent = "check" | "checkmate"

  interface PlayedMove {
    move: {
      algebraic: string
      capturedPiece: Piece?
      castle: boolean
      enPassant: boolean
      postSquare: Square
      prevSquare: Square
    }
    undo(): void
	}

  interface Game {
    board: ChessBoard
    moveHistory: Move[]
	}

  interface GameValidation {
    game: Game
	}

  interface ChessBoard {
    squares: Square[]
    lastMovedPiece: Piece
	}

  interface Move {
    algebraic: string
    capturedPiece: Piece?
    hashCode: string
    piece: Piece
    promotion: boolean
    postFile: File
    postRank: Rank
    prevFile: File
    prevRank: Rank
	}

  interface NotatedMove {
    dest: Square
    src: Square
	}

  interface ValidMove {
    squares: Square[]
    src: Square
	}

  interface Square {
    file: File
    piece: Piece?
    rank: Rank
	}

  type Piece = Pawn | Knight | Bishop | Rook | Queen | King

	interface Pawn {
    moveCount: number
    notation: ''
    side: Side
    type: 'pawn'
	}

  interface Knight {
    moveCount: number
    notation: 'N'
    side: Side
    type: 'pawn'
	}

  interface Bishop {
    moveCount: number
    notation: 'B'
    side: Side
    type: 'bishop'
	}

  interface Rook {
    moveCount: number
    notation: 'R'
    side: Side
    type: 'rook'
	}

  interface Queen {
    moveCount: number
    notation: 'Q'
    side: Side
    type: 'queen'
	}

  interface King {
    moveCount: number
    notation: 'K'
    side: Side
    type: 'king'
	}

  interface Side {
    name: "white" | "black"
  }
}

export = Chess