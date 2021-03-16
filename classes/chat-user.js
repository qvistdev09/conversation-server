const { emitter } = require('../chat-emitter');
const { commerce } = require('faker');
const randomColor = require('randomcolor');

class ChatUser {
  constructor(socket, id) {
    this.id = id;
    this.iconsCount = 50;
    this.spamTimeChunk = 1000;
    this.maxSpam = 4;
    this.blockLength = 10000;
    this.openFields = {
      name: this.getRandomName(),
      online: true,
      color: randomColor(),
      icon: this.getRandomIcon(),
    };
    this.hiddenFields = {
      socket,
      isTyping: false,
      typingTimeout: null,
      activeConversation: 0,
      spamBlock: false,
      spamReference: new Date(),
      spamCount: 0,
      spamTimeout: null,
    };
  }

  get socketId() {
    return this.hiddenFields.socket.id;
  }

  get socket() {
    return this.hiddenFields.socket;
  }

  get activeConversation() {
    return this.hiddenFields.activeConversation;
  }

  set activeConversation(channelId) {
    this.hiddenFields.activeConversation = channelId;
  }

  get publicInfo() {
    return {
      id: this.id,
      ...this.openFields,
    };
  }

  getRandomIcon() {
    return Math.floor(Math.random() * this.iconsCount + 1).toString();
  }

  getRandomName() {
    const adjective = commerce.productAdjective().toLowerCase();
    const noun = commerce.product().toLowerCase();
    return `${adjective}-${noun}`.replace(' ', '-');
  }

  setActiveConversation(conversationId) {
    this.hiddenFields.activeConversation = conversationId;
  }

  updateName(newName) {
    this.openFields.name = newName;
  }

  goOffline() {
    this.openFields.online = false;
  }

  block() {
    this.hiddenFields.spamBlock = true;
    emitter.toSocket(this.socket, 'spam-block', true);
    clearTimeout(this.hiddenFields.spamTimeout);
    this.hiddenFields.spamTimeout = setTimeout(() => {
      this.hiddenFields.spamBlock = false;
      this.hiddenFields.spamCount = 0;
      emitter.toSocket(this.socket, 'spam-block', false);
    }, this.blockLength);
  }

  spamCheck() {
    const timeSinceLast = new Date() - this.hiddenFields.spamReference;
    if (timeSinceLast < this.spamTimeChunk) {
      this.hiddenFields.spamCount += 1;
      if (this.hiddenFields.spamCount >= this.maxSpam - 1) {
        this.block();
      }
    } else {
      this.hiddenFields.spamReference = new Date();
      this.hiddenFields.spamCount = 0;
    }
  }

  cancelTyping() {
    clearTimeout(this.hiddenFields.typingTimeout);
    this.hiddenFields.isTyping = false;
    emitter.toRoom(this.activeConversation.toString(), 'user-stopped-typing', this.id);
  }

  triggerTyping() {
    clearTimeout(this.hiddenFields.typingTimeout);
    if (this.hiddenFields.isTyping === false) {
      this.hiddenFields.isTyping = true;
      emitter.toRoom(this.activeConversation.toString(), 'user-started-typing', this.id);
    }
    this.hiddenFields.typingTimeout = setTimeout(() => {
      this.hiddenFields.isTyping = false;
      emitter.toRoom(this.activeConversation.toString(), 'user-stopped-typing', this.id);
    }, 1000);
  }
}

module.exports = ChatUser;
