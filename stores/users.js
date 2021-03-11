const faker = require('faker');
const randomColor = require('randomcolor');
const BaseStore = require('./base');

class UsersStore extends BaseStore {
  constructor(io) {
    super();
    this.io = io;
    this.users = [];
  }

  get() {
    return this.users.map(user => ({
      name: user.name,
      pubId: user.pubId,
      online: user.online,
      color: user.color,
      icon: user.icon,
    }));
  }

  emit() {
    this.io.emit('user-list', this.get());
  }

  randomIcon() {
    return Math.floor(Math.random() * 51).toString();
  }

  randomColor() {
    return randomColor();
  }

  createName() {
    const adjective = faker.commerce.productAdjective().toLowerCase();
    const noun = faker.commerce.product().toLowerCase();
    return `${adjective}-${noun}`.replace(' ', '-');
  }

  add(socket) {
    const newUser = {
      name: this.createName(),
      pubId: this.createId(this.users, 'pubId'),
      socket,
      activeConversation: 0,
      online: true,
      isTyping: false,
      typingTimer: null,
      color: this.randomColor(),
      icon: this.randomIcon(),
    };
    this.users.push(newUser);
    socket.emit('user-id', newUser.pubId);
    this.emit();
  }

  setActiveConversation(socket, id) {
    const userMatch = this.users.find(user => user.online && user.socket.id === socket.id);
    if (!userMatch) {
      return;
    }
    userMatch.activeConversation = id;
  }

  remove(socket) {
    this.users = this.users.map(user => {
      if (user.online && user.socket.id === socket.id) {
        return {
          name: user.name,
          pubId: user.pubId,
          online: false,
        };
      }
      return user;
    });
    this.emit();
  }

  updateName(newUsername, socket) {
    const userMatch = this.users.find(user => user.online && user.socket.id === socket.id);
    if (userMatch) {
      userMatch.name = newUsername;
      this.emit();
    }
  }

  emitActive(conversationId) {
    const usersTyping = this.users
      .filter(user => user.isTyping)
      .filter(user => user.activeConversation === conversationId)
      .map(user => user.pubId);
    const roomId = conversationId.toString();
    this.io.to(roomId).emit('users-typing', usersTyping);
  }

  cancelTyping(socket) {
    const userMatch = this.users.find(user => user.online && user.socket.id === socket.id);
    if (userMatch) {
      clearTimeout(userMatch.typingTimer);
      userMatch.isTyping = false;
      this.emitActive(userMatch.activeConversation);
    }
  }

  updateTypingStatus(socket) {
    const userMatch = this.users.find(user => user.online && user.socket.id === socket.id);
    if (userMatch) {
      clearTimeout(userMatch.typingTimer);
      userMatch.isTyping = true;
      this.emitActive(userMatch.activeConversation);
      userMatch.typingTimer = setTimeout(() => {
        userMatch.isTyping = false;
        this.emitActive(userMatch.activeConversation);
      }, 1000);
    }
  }
}

module.exports = io => new UsersStore(io);
