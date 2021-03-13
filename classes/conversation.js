const BaseStore = require('./base-store');

class Conversation extends BaseStore {
  constructor(id, meta) {
    super();
    this.id = id;
    this.meta = meta;
    this.messages = [];
  }

  addMessage(userId, textContent) {
    const newMessage = {
      messageId: this.createId(this.messages, 'messageId'),
      userId,
      textContent,
      date: new Date().toString(),
    };
    this.messages.push(newMessage);
  }

  removeMessage(messageId) {
    this.messages = this.messages.filter(message => message.messageId !== messageId);
  }

  getMessage(messageId) {
    const matchedEntry = this.messages.find(message => message.messageId === messageId);
    return matchedEntry ? matchedEntry : null;
  }

  getSequence() {
    return this.messages.map(message => message.messageId).join('-');
  }
}

module.exports = Conversation;
