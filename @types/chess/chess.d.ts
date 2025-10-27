// Typescript Declaration File for Node Chess module
// https://www.npmjs.com/package/chess

export function create(opts?: { PGN: boolean }): AlgebraicGameClient
export function createSimple(): SimpleGameClient
export function fromFEN(fen: string, opts?: { PGN: boolean }): AlgebraicGameClient
export function createUCI(): UCIGameClient

export interface GameStatus {
  /** Whether either of the side is under check */
  isCheck: boolean
  /** Whether either of the side is checkmated */
  isCheckMate: boolean
  /** Whether game has ended by threefold repetition */
  isRepetition: boolean
  /** Whether game has ended by stalemate */
  isStalemate: boolean
}

export interface SimpleGameStatus extends GameStatus {
  /** Current board configuration */
  board: ChessBoard
}

export interface AlgebraicGameStatus extends SimpleGameStatus {
  /** Hash of next possible moves with key as notation and value as src-dest mapping */
  notatedMoves: Record<string, NotatedMove>
}

export interface UCIGameStatus extends SimpleGameStatus {
  /** Hash of next possible moves with key as UCI string and value as src-dest mapping */
  uciMoves: Record<string, NotatedMove>
}

export interface GameClient extends GameStatus {
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
  /** Returns the list of captured pieces in order */
  getCaptureHistory(): Piece[]
}

export interface SimpleGameClient extends GameClient {
  getStatus(): SimpleGameStatus
}

export interface AlgebraicGameClient extends GameClient {
  /** Hash of next possible moves with key as notation and value as src-dest mapping */
  notatedMoves: Record<string, NotatedMove>
  /** Whether notation is safe for PGN or not */
  PGN: boolean
  getStatus(): AlgebraicGameStatus
  getFen(): string
}

export interface UCIGameClient extends GameStatus {
  game: Game
  validMoves: ValidMove[]
  validation: GameValidation
  on(event: ChessEvent, cbk: () => void): void
  /** Make a move on the board using UCI notation */
  move(uci: string): PlayedMove
  getStatus(): UCIGameStatus
  /** Returns the list of captured pieces in order */
  getCaptureHistory(): Piece[]
}

export type File = string
export type Rank = number
export type ChessEvent = 'check' | 'checkmate'

export interface PlayedMove {
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

export interface Game {
  board: ChessBoard
  captureHistory: Piece[]
  moveHistory: Move[]
}

export interface GameValidation {
  game: Game
}

export interface ChessBoard {
  squares: Square[]
  lastMovedPiece: Piece
}

export interface Move {
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

export interface NotatedMove {
  dest: Square
  src: Square
}

export interface ValidMove {
  squares: Square[]
  src: Square
}

export interface Square {
  file: File
  piece: Piece
  rank: Rank
}

export interface Side {
  name: 'white' | 'black'
}

export interface IPiece {
  type: string
  notation: string
  moveCount: number
  side: Side
}

export class AbstractPiece implements IPiece {
  type: string
  notation: string
  moveCount: number
  side: Side
}

export type Piece = Pawn | Knight | Bishop | Rook | Queen | King

export class Pawn extends AbstractPiece {
  notation: ''
  type: 'pawn'
}

export class Knight extends AbstractPiece {
  notation: 'N'
  type: 'knight'
}

export class Bishop extends AbstractPiece {
  notation: 'B'
  type: 'bishop'
}

export class Rook extends AbstractPiece {
  notation: 'R'
  type: 'rook'
}

export class Queen extends AbstractPiece {
  notation: 'Q'
  type: 'queen'
}

export class King extends AbstractPiece {
  notation: 'K'
  type: 'king'
}

export declare const Chess: {
  create: typeof create;
  createSimple: typeof createSimple;
  fromFEN: typeof fromFEN;
  createUCI: typeof createUCI;
};

export default Chess;
