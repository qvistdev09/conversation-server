const { emitter } = require('../chat-emitter');
const BaseStore = require('./base-store');
const Conversation = require('./conversation');

class ConversationManager extends BaseStore {
  constructor() {
    super();
    this.channels = [];
  }

  get publicChannelList() {
    return this.channels.map(channel => ({
      id: channel.id,
      label: channel.meta.label,
    }));
  }

  findChannel(id) {
    return this.channels.find(channel => channel.id === id);
  }

  emitChannelList() {
    emitter.toAll(
      'channel-list',
      this.channels.map(channel => channel.publicInfo)
    );
  }

  createChannel(label) {
    const newId = this.createId(this.channels, 'id');
    const meta = {
      type: 'channel',
      label,
    };
    this.channels.push(new Conversation(newId, meta));
    this.emitChannelList();
  }
}

module.exports = ConversationManager;
