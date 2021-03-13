require('dotenv').config();
const app = require('express')();
const httpServer = require('http').createServer(app);
const options = {
  cors: {
    origin: process.env.ALLOWED_ORIGIN,
  },
};
const io = require('socket.io')(httpServer, options);

const chatManager = require('./classes/manager')(io);
chatManager.createChannel('main');

io.on('connection', socket => {
  chatManager.handleSocketConnect(socket);

  socket.on('disconnect', () => {
    chatManager.handleSocketDisconnect(socket);
  });

  socket.on('channel-message', textContent => {
    chatManager.newChannelMessage(socket, textContent);
  });

  socket.on('need-message', (channelId, messageId, callback) => {
    chatManager.serveMessage(channelId, messageId, callback);
  });

  socket.on('set-channel', channelId => {
    chatManager.handleChannelSwitch(socket, channelId);
  });

  socket.on('create-channel', label => {
    chatManager.createChannel(label);
  });

  socket.on('update-name', newName => {
    chatManager.handleNameChange(socket, newName);
  });

  socket.on('is-typing', () => {
    chatManager.handleIsTyping(socket);
  });
});

app.get('/', (req, res) => {
  res.send(`Currently connected sockets: ${io.of('/').sockets.size}`);
});

const port = process.env.PORT;

httpServer.listen(port, () => {
  console.log(`Server running at port ${port}`);
});
