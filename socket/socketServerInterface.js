const socketIO = require('socket.io');
const Trivia = require('../game/trivia.js');

/* GAME CONTROLS */

const TIME_FOR_QS = 5 * 1000;
const TIME_FOR_SHOW_ANS = 3 * 1000;
const TIME_FOR_SCORES = 5 * 1000;

/* HELPER FUNCTIONS */

const getRoom = socket => Object.keys(socket.rooms).filter(roomId => roomId !== socket.id)[0];

/* CLASS DEFINITION */

class SocketServerInterface {
  constructor(server) {
    this.io = socketIO(server);
    this.trivia = new Trivia();
    this.scheduledEmission = null;
  }

  listen(port) {
    this.io.listen(port);
    this.listenToPregameEvents();
  }

  /* HELPER FUNCTIONS */

  getGame(socketOrRoomId) {
    const roomId = typeof socketOrRoomId === 'object' ? getRoom(socketOrRoomId) : socketOrRoomId;
    return this.trivia.getGame(roomId);
  }

  scheduleEmission(emitter, time) {
    clearTimeout(this.scheduledEmission);
    this.scheduledEmission = setTimeout(emitter, time);
  }

  emitToRoom(socketOrRoomId, event, ...args) {
    const roomId = typeof socketOrRoomId === 'object' ? getRoom(socketOrRoomId) : socketOrRoomId;
    this.io.to(roomId).emit(event, ...args);
  }

  /* EVENT LISTENERS */

  listenToPregameEvents() {
    this.io.on('connection', (socket) => {
      socket.on('createRoom', this.handleCreateRoom.bind(this, socket));
      socket.on('joinRoom', this.handleJoinRoom.bind(this, socket));
    });
  }

  listenToHostEvents(socket) {
    socket.on('startGame', this.handleStartGame.bind(this, socket));
    socket.on('endGame', this.handleEndGame.bind(this, socket));
    socket.on('disconnecting', this.handleHostDisconnect.bind(this, socket));
  }

  listenToPlayerEvents(socket) {
    socket.on('submitAnswer', this.handleSubmitAnswer.bind(this, socket));
    socket.on('leaveGame', this.handleLeaveGame.bind(this, socket));
    socket.on('disconnecting', this.handleLeaveGame.bind(this, socket));
  }

  /* EVENT HANDLERS - PREGAME */

  handleCreateRoom(socket, callback) {
    const roomId = this.trivia.createRoom(socket.id);

    callback(null, roomId);

    socket.join(roomId);
    this.listenToHostEvents(socket);
  }

  handleJoinRoom(socket, roomId, username, callback) {
    try {
      this.trivia.joinGame(socket.id, roomId, username);

      // successful
      callback();

      socket.join(roomId);
      this.listenToPlayerEvents(socket);

      this.emitUpdatePlayers(roomId);
    } catch (error) {
      // unsuccessful
      callback(error.message);
    }
  }

  /* EVENT HANDLERS - HOST */

  handleStartGame(socket, callback) {
    const game = this.getGame(socket);

    if (game.hasNoPlayers()) {
      callback('There are no players in the room');
    } else {
      this.emitNextQuestion(socket);
    }
  }

  handleEndGame(socket) {
    const roomId = getRoom(socket);
    socket.leave(roomId);

    this.trivia.endGame(roomId);
  }

  handleHostDisconnect(socket) {
    this.emitHostDisconnect(socket);
    this.handleEndGame(socket);
  }

  /* EVENT HANDLERS - PLAYER */

  handleSubmitAnswer(socket, answer) {
    const game = this.getGame(socket);

    game.receiveAnswer(socket.id, answer);

    if (game.allAnswered()) {
      this.scheduleEmission(this.emitShowAnswer.bind(this, socket), 0);
    }
  }

  handleLeaveGame(socket) {
    const roomId = getRoom(socket);
    const game = this.getGame(socket);

    socket.leave(roomId);

    if (game) {
      // if game has not yet ended
      game.removePlayer(socket.id);
      this.emitUpdatePlayers(roomId);
    }
  }

  /* EVENT EMITTERS */

  emitUpdatePlayers(roomId) {
    const game = this.getGame(roomId);
    this.emitToRoom(roomId, 'updatePlayers', game.getScores(roomId));
  }

  emitNextQuestion(socket) {
    const game = this.getGame(socket);
    this.emitToRoom(socket, 'nextQuestion', game.nextQuestion());

    this.scheduleEmission(this.emitShowAnswer.bind(this, socket), TIME_FOR_QS);
  }

  emitShowAnswer(socket) {
    const game = this.getGame(socket);
    this.emitToRoom(socket, 'showAnswer', game.getAnswer());

    this.scheduleEmission(this.emitShowScores.bind(this, socket), TIME_FOR_SHOW_ANS);
  }

  emitShowScores(socket) {
    const game = this.getGame(socket);

    if (game.atLastQuestion()) {
      this.emitToRoom(socket, 'showFinalScores', game.getScores());
    } else {
      this.emitToRoom(socket, 'showRoundScores', game.getScores());

      this.scheduleEmission(this.emitNextQuestion.bind(this, socket), TIME_FOR_SCORES);
    }
  }

  emitHostDisconnect(socket) {
    this.emitToRoom(socket, 'hostDisconnect');
  }
}

module.exports = SocketServerInterface;
