// Typescript Declaration File for Node Chess module
// https://www.npmjs.com/package/chess

declare namespace Chess {
  export function create(opts?: { PGN: boolean }): AlgebraicGameClient
  export function createSimple(): SimpleGameClient

  interface GameStatus {
    /** Whether either of the side is under check */
    isCheck: boolean
    /** Whether either of the side is checkmated */
    isCheckMate: boolean
    /** Whether game has ended by threefold repetition */
    isRepetition: boolean
    /** Whether game has ended by stalemate */
    isStalemate: boolean
  }

  interface SimpleGameStatus extends GameStatus {
    /** Current board configuration */
    board: ChessBoard
  }

  interface AlgebraicGameStatus extends SimpleGameStatus {
    /** Hash of next possible moves with key as notation and value as src-dest mapping */
    notatedMoves: Record<string, NotatedMove>
  }

  interface GameClient extends GameStatus {
    /** The Game object, which includes the board and move history. */
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
    getStatus(): AlgebraicGameStatus | SimpleGameStatus
  }

  interface SimpleGameClient extends GameClient {
    getStatus(): SimpleGameStatus
  }

  interface AlgebraicGameClient extends GameClient {
    /** Hash of next possible moves with key as notation and value as src-dest mapping */
    notatedMoves: Record<string, NotatedMove>
    /** Whether notation is safe for PGN or not */
    PGN: boolean
    getStatus(): AlgebraicGameStatus
  }

  type File = string
  type Rank = number
  type ChessEvent = 'check' | 'checkmate'

  interface PlayedMove {
    move: {
      algebraic: string
      capturedPiece: Piece
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
    capturedPiece: Piece
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
    piece: Piece
    rank: Rank
  }

  interface Side {
    name: 'white' | 'black'
  }

  interface IPiece {
    type: string
    notation: string
    moveCount: number
    side: Side
  }

  class AbstractPiece implements IPiece {
    type: string
    notation: string
    moveCount: number
    side: Side
  }

  type Piece = Pawn | Knight | Bishop | Rook | Queen | King

  class Pawn extends AbstractPiece {
    notation: ''
    type: 'pawn'
  }

  class Knight extends AbstractPiece {
    notation: 'N'
    type: 'knight'
  }

  class Bishop extends AbstractPiece {
    notation: 'B'
    type: 'bishop'
  }

  class Rook extends AbstractPiece {
    notation: 'R'
    type: 'rook'
  }

  class Queen extends AbstractPiece {
    notation: 'Q'
    type: 'queen'
  }

  class King extends AbstractPiece {
    notation: 'K'
    type: 'king'
  }
}

export = Chess
