/* eslint sort-imports: 0 */
import { EventEmitter } from 'events';
import { Game } from './game.js';
import { GameValidation } from './gameValidation.js';
import { Piece } from './piece.js';
import { PieceType } from './piece.js';

// private helpers

function parseUCI(uci) {
  if (typeof uci !== 'string') {
    return null;
  }

  // UCI format: e2e4, e7e8q (promotion), case-insensitive for promo
  let
    formatRegex = /^([a-h][1-8])([a-h][1-8])([qrbnQRBN])?$/,
    uciMove = uci.trim().match(formatRegex);

  if (!uciMove) {
    return null;
  }

  let
    dest = { file: uciMove[2][0], rank: Number(uciMove[2][1]) },
    promo = uciMove[3] ? uciMove[3].toUpperCase() : '',
    src = { file: uciMove[1][0], rank: Number(uciMove[1][1]) };

  return { dest, promo, src };
}

function updateGameClient(gameClient) {
  return gameClient.validation.start((err, result) => {
    if (err) {
      throw new Error(err);
    }

    gameClient.isCheck = result.isCheck;
    gameClient.isCheckmate = result.isCheckmate;
    gameClient.isRepetition = result.isRepetition;
    gameClient.isStalemate = result.isStalemate;
    gameClient.validMoves = result.validMoves;
    gameClient.uciMoves = notateUCI(result.validMoves);
  });
}

function notateUCI(validMoves) {
  let 
    i = 0,
    isPromotion = false,
    notation = {};

  // iterate through all valid moves and create UCI notation
  for (; i < validMoves.length; i++) {
    let 
      p = validMoves[i].src.piece,
      src = validMoves[i].src;

    // reset inner index for each piece's move list
    for (let n = 0; n < validMoves[i].squares.length; n++) {
      // get the destination square for this move
      let sq = validMoves[i].squares[n];

      // base notation
      let base = `${src.file}${src.rank}${sq.file}${sq.rank}`;

      // check for potential promotion
      /* eslint no-magic-numbers: 0 */
      isPromotion = 
        (sq.rank === 8 || sq.rank === 1) && 
        p.type === PieceType.Pawn;
      
      if (isPromotion) {
        // add all promotion options
        ['q', 'r', 'b', 'n'].forEach((promo) => {
          notation[`${base}${promo}`] = {
            dest: sq,
            src
          };
        });

        continue
      }

      // regular move
      notation[base] = {
        dest: sq,
        src
      };
    }
  }

  return notation;
}

export class UCIGameClient extends EventEmitter {
  constructor(game) {
    super();

    this.game = game;
    this.isCheck = false;
    this.isCheckmate = false;
    this.isRepetition = false;
    this.isStalemate = false;
    this.uciMoves = {};
    this.validMoves = [];
    this.validation = GameValidation.create(this.game);

    // bubble the game and board events
    ['check', 'checkmate'].forEach((ev) => {
      this.game.on(ev, (data) => this.emit(ev, data));
    });

    ['capture', 'castle', 'enPassant', 'move', 'promote', 'undo'].forEach((ev) => {
      this.game.board.on(ev, (data) => this.emit(ev, data));
    });

    const self = this;
    this.on('undo', () => {
      // force an update
      self.getStatus(true);
    });
  }

  static create() {
    let 
      game = Game.create(),
      gameClient = new UCIGameClient(game);

    updateGameClient(gameClient);

    return gameClient;
  }

  getStatus(forceUpdate) {
    if (forceUpdate) {
      updateGameClient(this);
    }

    return {
      board: this.game.board,
      isCheck: this.isCheck,
      isCheckmate: this.isCheckmate,
      isRepetition: this.isRepetition,
      isStalemate: this.isStalemate,
      uciMoves: this.uciMoves
    };
  }

  getCaptureHistory() {
    return this.game.captureHistory;
  }

  move(uci) {
    let 
      canonical = null,
      dest = null,
      move = null,
      parsed = parseUCI(uci),
      promo = null,
      requiresPromotion = false,
      side = null,
      src = null, 
      srcSquare = null;

    if (!parsed) {
      throw new Error(`UCI is invalid (${uci})`);
    }

    // destructure the parsed UCI move
    ({ src, dest, promo } = parsed);

    // normalize UCI key to compare with generated map
    canonical = promo
      ? `${src.file}${src.rank}${dest.file}${dest.rank}${promo.toLowerCase()}`
      : `${src.file}${src.rank}${dest.file}${dest.rank}`;

    // ensure move exactly matches a generated UCI move
    if (!this.uciMoves || !this.uciMoves[canonical]) {
      throw new Error(`Move is invalid (${uci})`);
    }

    // determine the current side
    side = this.game.getCurrentSide();

    // additional safety: enforce promotion semantics
    srcSquare = this.game.board.getSquare(src.file, src.rank);
    requiresPromotion =
      srcSquare && srcSquare.piece && srcSquare.piece.type === PieceType.Pawn &&
      (dest.rank === 8 || dest.rank === 1);

    if (requiresPromotion && !promo) {
      throw new Error(`Promotion required for move (${uci})`);
    }

    if (promo && !requiresPromotion) {
      throw new Error(`Promotion flag not allowed for move (${uci})`);
    }

    // make the move
    move = this.game.board.move(`${src.file}${src.rank}`, `${dest.file}${dest.rank}`);
    if (move) {
      // apply pawn promotion if applicable (already validated above)
      if (promo) {
        let piece;
        switch (promo) {
          case 'B':
            piece = Piece.createBishop(side);
            break;
          case 'N':
            piece = Piece.createKnight(side);
            break;
          case 'Q':
            piece = Piece.createQueen(side);
            break;
          case 'R':
            piece = Piece.createRook(side);
            break;
          default:
            piece = null;
            break;
        }

        if (piece) {
          this.game.board.promote(move.move.postSquare, piece);
        }
      }

      updateGameClient(this);
      
      return move;
    }

    throw new Error(`Move is invalid (${uci})`);
  }
}

export default { UCIGameClient };
