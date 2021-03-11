require('dotenv').config();
const app = require('express')();
const httpServer = require('http').createServer(app);
const options = {
  cors: {
    origin: process.env.ALLOWED_ORIGIN,
  },
};
const io = require('socket.io')(httpServer, options);

// users store
const { addUser, removeUser, getUsers } = require('./stores/users');

io.on('connection', socket => {
  addUser(socket);
  io.emit('userlist', getUsers());

  socket.on('disconnect', () => {
    removeUser(socket);
    io.emit('userlist', getUsers());
  });
});

app.get('/', (req, res) => {
  res.send(`Currently connected sockets: ${io.of('/').sockets.size}`);
});

const port = process.env.PORT;

httpServer.listen(port, () => {
  console.log(`Server running at port ${port}`);
});
