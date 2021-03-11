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
conversations.createChannel('channel2');

// users store
const users = require('./stores/users')(io);

io.on('connection', socket => {
  users.add(socket);
  socket.join('0');
  conversations.emitChannelList(socket);
  conversations.emitMessages(0, socket);

  socket.on('disconnect', () => {
    users.remove(socket);
  });

  socket.on('message', data => {
    conversations.addMessage(data);
  });

  socket.on('set-active', conversationId => {
    socket.leaveAll();
    socket.join(conversationId.toString());
    conversations.emitMessages(conversationId, socket);
  });

  socket.on('create-channel', label => {
    conversations.createChannel(label);
  });

  socket.on('update-name', newUsername => {
    users.updateName(newUsername, socket);
  });

});

app.get('/', (req, res) => {
  res.send(`Currently connected sockets: ${io.of('/').sockets.size}`);
});

const port = process.env.PORT;

httpServer.listen(port, () => {
  console.log(`Server running at port ${port}`);
});
