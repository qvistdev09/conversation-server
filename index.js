require('dotenv').config();
const app = require('express')();
const httpServer = require('http').createServer(app);
const options = {
  cors: {
    origin: process.env.ALLOWED_ORIGIN,
  },
};
const io = require('socket.io')(httpServer, options);

// conversations store
const conversations = require('./stores/conversations')(io);
conversations.createChannel('main');

// users store
const users = require('./stores/users')(io);

io.on('connection', socket => {
  users.add(socket);
  socket.on('disconnect', () => {
    users.remove(socket);
  });
});

app.get('/', (req, res) => {
  res.send(`Currently connected sockets: ${io.of('/').sockets.size}`);
});

const port = process.env.PORT;

httpServer.listen(port, () => {
  console.log(`Server running at port ${port}`);
});
