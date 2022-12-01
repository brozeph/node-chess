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

// output
console.log(JSON.stringify(status, 0, 2));