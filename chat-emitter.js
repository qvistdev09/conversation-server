const app = require('./app');
const httpServer = require('http').createServer(app);
const options = {
  cors: {
    origin: process.env.ALLOWED_ORIGIN,
  },
};
const io = require('socket.io')(httpServer, options);

const emitter = {
  io,
  toRoom: (room, event, ...args) => {
    io.to(room).emit(event, ...args);
  },
  toSocket: (socket, event, ...args) => {
    socket.emit(event, ...args);
  },
  toAll: (event, ...args) => {
    io.emit(event, ...args);
  },
};

module.exports = { httpServer, emitter };
