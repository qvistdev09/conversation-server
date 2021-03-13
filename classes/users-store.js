const BaseStore = require('./base-store');

const { commerce } = require('faker');
const randomColor = require('randomcolor');

class UsersStore extends BaseStore {
  constructor() {
    super();
    this.users = [];
    this.iconsCount = 50;
  }

  getRandomIcon() {
    return Math.floor(Math.random() * this.iconsCount + 1).toString();
  }

  getRandomColor() {
    return randomColor();
  }

  getRandomName() {
    const adjective = commerce.productAdjective().toLowerCase();
    const noun = commerce.product().toLowerCase();
    return `${adjective}-${noun}`.replace(' ', '-');
  }

  findUser(socket) {
    return this.users.find(user => user.hiddenFields.socket.id === socket.id);
  }

  add(socket) {
    const newUser = {
      id: this.createId(this.users, 'id'),
      openFields: {
        name: this.getRandomName(),
        online: true,
        color: this.getRandomColor(),
        icon: this.getRandomIcon(),
      },
      hiddenFields: {
        socket,
        isTyping: false,
        typingTimer: null,
        activeConversation: 0,
      },
    };
    this.users.push(newUser);
  }

  remove(socket) {
    const userMatch = this.findUser(socket);
    if (userMatch) {
      userMatch.openFields.online = false;
    }
  }

  updateName(socket, newName) {
    const userMatch = this.findUser(socket);
    if (userMatch) {
      userMatch.openFields.name = newName;
    }
  }

  setActiveConversation(socket, conversationId) {
    const userMatch = this.findUser(socket);
    if (userMatch) {
      userMatch.hiddenFields.activeConversation = conversationId;
    }
  }

  getPublicList() {
    return this.users.map(userData => ({ id: userData.id, ...userData.openFields }));
  }

  getRoomOfUser(socket) {
    const userMatch = this.findUser(socket);
    if (userMatch) {
      return userMatch.hiddenFields.activeConversation;
    }
    return null;
  }

  getAllActiveInRoom(conversationId) {
    return this.users
      .filter(user => user.hiddenFields.activeConversation === conversationId)
      .filter(user => user.hiddenFields.isTyping)
      .map(user => user.id);
  }

  cancelTyping(socket, emitterCallback) {
    const userMatch = this.findUser(socket);
    if (userMatch) {
      const { hiddenFields } = userMatch;
      clearTimeout(hiddenFields.typingTimer);
      hiddenFields.isTyping = false;
      emitterCallback(hiddenFields.activeConversation);
    }
  }

  triggerIsTyping(socket, emitterCallback) {
    const userMatch = this.findUser(socket);
    if (userMatch) {
      const { hiddenFields } = userMatch;
      clearTimeout(hiddenFields.typingTimer);
      hiddenFields.isTyping = true;
      emitterCallback(hiddenFields.activeConversation);
      hiddenFields.typingTimer = setTimeout(() => {
        hiddenFields.isTyping = false;
        emitterCallback(hiddenFields.activeConversation);
      }, 1000);
    }
  }
}

module.exports = UsersStore;
