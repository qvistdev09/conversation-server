const { emitter } = require('../chat-emitter');
const BaseStore = require('./base-store');
const UserManager = require('./user-manager');
const ConversationManager = require('./conversation-manager');

class Manager extends BaseStore {
  constructor() {
    super();
    this.conversationManager = new ConversationManager();
    this.userManager = new UserManager();
  }

  handleNewMessage(socket, textContent) {
    const matchedUser = this.userManager.findUser(socket);
    if (matchedUser && matchedUser.hiddenFields.spamBlock === false) {
      const matchedConversation = this.conversationManager.findChannel(matchedUser.activeConversation);
      if (matchedConversation) {
        matchedUser.spamCheck();
        matchedUser.cancelTyping();
        matchedConversation.addMessage(matchedUser.id, textContent);
      }
    }
  }

  handleSocketConnect(socket) {
    this.userManager.add(socket);
    emitter.toSocket(socket, 'is-connected');
    emitter.toSocket(socket, 'clear-cache');
    emitter.toSocket(socket, 'channel-list', this.conversationManager.publicChannelList);
    socket.leaveAll();
    socket.join('0');
    const mainChannel = this.conversationManager.findChannel(0);
    if (mainChannel) {
      emitter.toSocket(socket, 'new-sequence', mainChannel.sequence, 0);
    }
  }

  handleIsTyping(socket) {
    const match = this.userManager.findUser(socket);
    if (match) {
      match.triggerTyping();
    }
  }

  handleChannelSwitch(socket, channelId) {
    const matchedChannel = this.conversationManager.findChannel(channelId);
    const matchedUser = this.userManager.findUser(socket);
    if (matchedChannel && matchedUser) {
      socket.leaveAll();
      socket.join(channelId.toString());
      emitter.toSocket(socket, 'new-sequence', matchedChannel.sequence, channelId);
      emitter.toSocket(socket, 'replace-people-typing-aray', this.userManager.getAllActiveInRoom(channelId));
      matchedUser.cancelTyping();
      matchedUser.activeConversation = channelId;
    }
  }

  handleNameChange(socket, newName) {
    const match = this.userManager.findUser(socket);
    if (match) {
      match.updateName(newName);
      this.userManager.emitPublicList();
    }
  }

  handleGetMessagesRequest(channelId, messageIdArray, callback) {
    const channelMatch = this.conversationManager.findChannel(channelId);
    if (channelMatch) {
      const retrievedMessages = [];
      messageIdArray.forEach(request => retrievedMessages.push(channelMatch.getMessage(request)));
      return callback(retrievedMessages);
    }
    callback(null);
  }
}

module.exports = () => new Manager();
