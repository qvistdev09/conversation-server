require('dotenv').config();
const { httpServer, emitter } = require('./chat-emitter');

const chatManager = require('./classes/manager')();
chatManager.conversationManager.createChannel('main');

emitter.io.on('connection', socket => {
  chatManager.handleSocketConnect(socket);
  chatManager.handleBotSpawnRequest();
  console.log(socket.handshake.headers['x-forwarded-for']);

  socket.on('disconnect', () => {
    chatManager.userManager.remove(socket);
  });

  socket.on('channel-message', textContent => {
    chatManager.handleNewMessage(socket, textContent);
  });

  socket.on('need-messages', (channelId, messageIdArray, callback) => {
    chatManager.handleGetMessagesRequest(channelId, messageIdArray, callback);
  });

  socket.on('set-channel', channelId => {
    chatManager.handleChannelSwitch(socket, channelId);
  });

  socket.on('create-channel', label => {
    chatManager.conversationManager.createChannel(label);
  });

  socket.on('update-name', newName => {
    chatManager.handleNameChange(socket, newName);
  });

  socket.on('is-typing', () => {
    chatManager.handleIsTyping(socket);
  });
});

const port = process.env.PORT;

httpServer.listen(port, () => {
  console.log(`Server running at port ${port}`);
});
