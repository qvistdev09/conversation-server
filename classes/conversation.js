const { emitter } = require('../chat-emitter');
const BaseStore = require('./base-store');

class Conversation extends BaseStore {
  constructor(id, meta) {
    super();
    this.id = id;
    this.meta = meta;
    this.messages = [];
  }

  get publicInfo() {
    return {
      id: this.id,
      label: this.meta.label,
    };
  }

  get sequence() {
    return this.messages.map(message => message.messageId).join('-');
  }

  addMessage(userId, textContent) {
    const newMessage = {
      messageId: this.createId(this.messages, 'messageId'),
      userId,
      textContent,
      date: new Date().toString(),
    };
    this.messages.push(newMessage);
    emitter.toAll('new-channel-message', this.id);
    this.emitSequence();
  }

  removeMessage(messageId) {
    this.messages = this.messages.filter(message => message.messageId !== messageId);
  }

  getMessage(messageId) {
    const matchedEntry = this.messages.find(message => message.messageId === messageId);
    return matchedEntry ? matchedEntry : null;
  }

  emitSequence() {
    emitter.toRoom(this.id.toString(), 'new-sequence', this.sequence, this.id);
  }
}

module.exports = Conversation;
