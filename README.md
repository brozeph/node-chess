# `node-chess` - the algebraic chess engine

`node-chess` is an algebraic notation driven chess engine that can validate board position and produce a list of viable moves (notated).

[![Build Status](https://secure.travis-ci.org/brozeph/node-chess.png?branch=main)](http://travis-ci.org/brozeph/node-chess?branch=main) [![Coverage Status](https://coveralls.io/repos/brozeph/node-chess/badge.png?branch=main)](https://coveralls.io/r/brozeph/node-chess?branch=main)

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

```bash
npm install chess
```

## Public API

### Create a new game

```javascript
import chess from 'chess';

// create a game client
const gameClient = chess.create();
let move, status;

// capture events
gameClient.on('check', (attack) => {
  // get more details about the attack on the King
  console.log(attack);
});

// look at the status and valid moves
status = gameClient.getStatus();

// make a move
move = gameClient.move('a4');

// look at the status again after the move to see
// the opposing side's available moves
status = gameClient.getStatus();
```

#### PGN (Portable Game Format) Algebraic Game Client

To ensure the notation returned is safe for PGN, you must supply PGN as an option in the call to `create`:

```javascript
import chess from 'chess';

// create a game client
const gameClient = chess.create({ PGN : true });
let move, status;

// look at the status and valid moves
status = gameClient.getStatus();

// make a move
move = gameClient.move('a4');

// look at the status again after the move to see
// the opposing side's available moves
status = gameClient.getStatus();
```

#### Game Events

The game client (both algebraic, simple) emit a number of events when scenarios occur on the board over the course of a match.

```javascript
import chess from 'chess';

// create a game client
const gameClient = chess.create({ PGN : true });

// when a capture occurs
gameClient.on('capture', (move) => {
  console.log('A piece has been captured!');
  console.log(move);
});

// when a castle occurs
gameClient.on('castle', (move) => {
  console.log('A castle has occured!');
  console.log(move);
});

// when a King is placed in check
gameClient.on('check', (attack) => {
  console.log('The King is under attack!');
  console.log(attack);
});

// when King is placed in checkmate
gameClient.on('checkmate', (attack) => {
  console.log('The game has ended due to checkmate!');
  console.log(attack);
});

// when en Passant occurs
gameClient.on('enPassant', (move) => {
  console.log('An en Passant has occured!');
  console.log(move);
});

// when a move occurs on the board
gameClient.on('move', (move) => {
  console.log('A piece was moved!');
  console.log(move);
});

// when a Pawn promotion occurs
gameClient.on('promote', (square) => {
  console.log('A Pawn has been promoted!');
  console.log(square);
});

// when an undo function is called on a move
gameClient.on('undo', (move) => {
  console.log('A previous move was undone!');
  console.log(move);
});
```

##### The `capture` Event

The `capture` event is emitted when a piece has been captured during game play. The `capture` event data is the same as the [move](#the-gameclientmove-function) object that is provided as a response to [gameClient.move()](#the-gameclientmove-function).

##### The `check` Event

The `check` event is emitted for each attack on a King that occurs on the board. In the event a single move results in multiple pieces putting a King in check, multiple `check` events will be emitted, one for each attack.

###### The `attack` Object

The attack object contains the attacking square and the King square. The properties of the attack object are:

* attackingSquare - The square object from which the attacker originates which includes the piece conducting the attack
* kingSquare - The square object representing the King that is under attack

```javascript
{
  attackingSquare : {
    file: 'f',
    rank: 6,
    piece: {
      moveCount: 3,
      side: {
        name: 'white'
      },
      type: 'knight',
      notation: 'N'
    }
  },
  kingSquare : {
    file: 'e',
    rank: 8,
    piece: {
      moveCount: 0,
      side: {
        name: 'black'
      },
      type: 'king',
      notation: 'K'
    }
  }
}
```

##### The `checkmate` Event

The `checkmate` event is emitted when checkmate has been detected on the board. The `checkmate` event data is the same as the [attack](#attack) object that is provided for the `check` event.

##### The `castle` Event

The `castle` event is emitted when a castle move occurs on the board. The `castle` event data is the [move](#the-gameclientmove-function) object that is also returned when performing a [gameClient.move()](#the-gameclientmove-function).

##### The `enPassant` Event

When en Passant occurs, the `enPassant` event is emitted. The `enPassant` event data is the [move](#the-gameclientmove-function) object that is also returned when performing a [gameClient.move()](#the-gameclientmove-function).

##### The `move` Event

Any time a move occurs on the board, the `move` event is emitted. The `enPassant` event data is the [move](#the-gameclientmove-function) object that is also returned when performing a [gameClient.move()](#the-gameclientmove-function).

##### The `promote` Event

When a Pawn promotion occurs, the `promote` event is emitted. The `promote` event data is the Square object upon which the newly promoted piece resides, which looks as follows:

```javascript
{
  file: 'a',
  piece: {
    moveCount: 2,
    notation: 'R',
    side: {
      name: 'white'
    },
    type: 'rook' },
  rank: 8
}
```

##### The `undo` Event

The `undo` event is emitted when a previous move that occured on the board is reversed using the `undo` method. The `undo` event data is the same [move](#the-gameclientmove-function) object that is also returned when performing a [gameClient.move()](#the-gameclientmove-function).

#### The `gameClient.move()` Function

From the above example, the response object that is returned when calling chess.move() looks like the following:

```javascript
{
  move: {
    // the captured piece (if capture occurred)
    capturedPiece: null,
    // was the move a castle?
    castle: false,
    // was the move en Passant?
    enPassant: false,
    // tje square a piece was moved to
    postSquare: {
      file: 'a',
      rank: 4,
      piece: {
        moveCount: 1,
        side: {
          name: 'white'
        },
        type: 'pawn',
        notation: 'R'
      }
    },
    // the square that the piece came from
    prevSquare: {
      file: 'a',
      rank: 2,
      piece: null
    }
  },
  // undo() can be used to back out the previous move
  undo: __function__
}
```

##### The `move` Object

The move object contains a collection of properties and an undo function pointer. The five properties of the move object are:

* capturedPiece - If a piece was captured during the move, it will be represented here.
* castle - If the move was a castle, this will be set to true, otherwise false.
* enPassant - If the move was en passant, this will be set to true, otherwise false.
* postSquare - The destination square object for the move.
* prevSquare - The square object from which the move was originated.

##### The `undo()` Function

To back out the move:

```javascript
move.undo();
```

#### The `gameClient.getStatus()` Function

The status object is as follows (abbreviated in parts to improve readability):

```javascript
{
  // this is the top level board
  board: {
    // an array of all squares on the board
    squares: [{
        file: 'a',
        rank: 1,
        piece: {
          moveCount: 0,
          side: {
            name: 'white'
          },
          type: 'rook',
          notation: 'R'
        }
      },
      /* the rest of the squares... */
    ]
  },
  isCheck: false, // is the King currently in check?
  isCheckmate: false, // is the King currently in checkmate?
  isRepetition: false, // has 3-fold repetition occurred?
  isStalemate: false, // is the board in stalemate?
  // all possible moves (notated) with details for each move
  notatedMoves: {
    a3: {
      src: {
        file: 'a'
        rank: 2,
        piece: {
          moveCount: 0,
          side: {
            name: 'white'
          },
          type: 'pawn',
          notation: 'R'
        }
      },
      dest: {
        file: 'a',
        rank: 3,
        piece: null
      }
    },
    /* the rest of the available moves... */
  }
}
```

##### The `status` Object

The status object returned via the getStatus() function call contains several Object properties:

* board - The underlying board Object which contains the collection of squares.
* isCheck - If the status of the board is check, this will be true.
* isCheckmate - If the status of the board is checkmate, this will be true. Additionally, the notatedMoves property will be empty.
* isRepetition - If 3-fold repetition has occurred, this will be true. The notatedMoves property will not be empty as the game can technically continue.
* isStalemate - If the board is in stalemate, this will be set to true.
* notatedMoves - A hash containing all available moves on the board.

##### The `status.notatedMoves` Object

Each object within the notatedMoves hash represents a possible move. The key to the hash is the algebraic notation of the move. The value for each key in the hash has two properties:

* src - The starting square (which contains a piece) of the move
* dest - The destination square of the move

The following code is an example of how to iterate the available notated moves for the game.

```javascript
import chess from 'chess';
const gameClient = chess.create();

let
  i = 0,
  key = '',
  status = gameClient.getStatus();

Object.keys(status.notatedMoves).map((key, index) => {
  console.log(status.notatedMoves[key]);
  return { ...status.notatedMoves[key], key };
});
```

#### Example usage

The following usage of the code is playing out the 3rd game in the series between Fischer and Petrosian in Buenos Aires, 1971. The game ended a draw due to 3 fold repetition.

```javascript
import chess from 'chess';
const util = require('util');

const gameClient = chess.create();

// 1. e4 e6
gameClient.move('e4');
gameClient.move('e6');
// 2. d4 d5
gameClient.move('d4');
gameClient.move('d5');
// 3. Nc3 Nf6
gameClient.move('Nc3');
gameClient.move('Nf6');
// 4. Bg5 dxe4
gameClient.move('Bg5');
gameClient.move('dxe4');
// 5. Nxe4 Be7
gameClient.move('Nxe4');
gameClient.move('Be7');
// 6. Bxf6 gxf6
gameClient.move('Bxf6');
gameClient.move('gxf6');
// 7. g3 f5
gameClient.move('g3');
gameClient.move('f5');
// 8. Nc3 Bf6
gameClient.move('Nc3');
gameClient.move('Bf6');
// 9. Nge2 Nc6
gameClient.move('Nge2');
gameClient.move('Nc6');
// 10. d5 exd5
gameClient.move('d5');
gameClient.move('exd5');
// 11. Nxd5 Bxb2
gameClient.move('Nxd5');
gameClient.move('Bxb2');
// 12. Bg2 O-O
gameClient.move('Bg2');
gameClient.move('0-0');
// 13. O-O Bh8
gameClient.move('0-0');
gameClient.move('Bh8');
// 14. Nef4 Ne5
gameClient.move('Nef4');
gameClient.move('Ne5');
// 15. Qh5 Ng6
gameClient.move('Qh5');
gameClient.move('Ng6');
// 16. Rad1 c6
gameClient.move('Rad1');
gameClient.move('c6');
// 17. Ne3 Qf6
gameClient.move('Ne3');
gameClient.move('Qf6');
// 18. Kh1 Bg7
gameClient.move('Kh1');
gameClient.move('Bg7');
// 19. Bh3 Ne7
gameClient.move('Bh3');
gameClient.move('Ne7');
// 20. Rd3 Be6
gameClient.move('Rd3');
gameClient.move('Be6');
// 21. Rfd1 Bh6
gameClient.move('Rfd1');
gameClient.move('Bh6');
// 22. Rd4 Bxf4
gameClient.move('Rd4');
gameClient.move('Bxf4');
// 23. Rxf4 Rad8
gameClient.move('Rxf4');
gameClient.move('Rad8');
// 24. Rxd8 Rxd8
gameClient.move('Rxd8');
gameClient.move('Rxd8');
// 25. Bxf5 Nxf5
gameClient.move('Bxf5');
gameClient.move('Nxf5');
// 26. Nxf5 Rd5
gameClient.move('Nxf5');
gameClient.move('Rd5');
// 27. g4 Bxf5
gameClient.move('g4');
gameClient.move('Bxf5');
// 28. gxf5 h6
gameClient.move('gxf5');
gameClient.move('h6');
// 29. h3 Kh7
gameClient.move('h3');
gameClient.move('Kh7');
// 30. Qe2 Qe5
gameClient.move('Qe2');
gameClient.move('Qe5');
// 31. Qh5 Qf6
gameClient.move('Qh5');
gameClient.move('Qf6');
// 32. Qe2 Re5
gameClient.move('Qe2');
gameClient.move('Re5');
// 33. Qd3 Rd5
gameClient.move('Qd3');
gameClient.move('Rd5');
// 34. Qe2
gameClient.move('Qe2');

console.log(util.inspect(gameClient.getStatus(), false, 7));
```

##### Output

The above code produces the following output:

```javascript
{
  board: {
    squares: [
      { file: 'a', rank: 1, piece: null },
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
      { file: 'h', rank: 8, piece: null }
    ],
  },
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
```
