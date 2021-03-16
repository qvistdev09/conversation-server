const { emitter } = require('../chat-emitter');
const BaseStore = require('./base-store');
const ChatUser = require('./chat-user');

class UserManager extends BaseStore {
  constructor() {
    super();
    this.users = [];
  }

  emitPublicList() {
    emitter.toAll(
      'user-list',
      this.users.map(user => user.publicInfo)
    );
  }

  findUser(socket) {
    return this.users.find(user => user.socketId === socket.id);
  }

  add(socket) {
    const newId = this.createId(this.users, 'id');
    this.users.push(new ChatUser(socket, newId));
    emitter.toSocket(socket, 'user-id', newId);
    this.emitPublicList();
  }

  remove(socket) {
    const match = this.findUser(socket);
    if (match) {
      match.goOffline();
      this.emitPublicList();
    }
  }

  setActiveConversation(socket, conversationId) {
    const match = this.findUser(socket);
    if (match) {
      match.setActiveConversation(conversationId);
    }
  }

  getRoomOfUser(socket) {
    const match = this.findUser(socket);
    if (match) {
      return match.activeConversation;
    }
    return null;
  }

  getAllActiveInRoom(conversationId) {
    return this.users
      .filter(user => user.activeConversation === conversationId)
      .filter(user => user.hiddenFields.isTyping)
      .map(user => user.id);
  }
}

module.exports = UserManager;
