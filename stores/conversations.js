const BaseStore = require('./base');

class ConversationsStore extends BaseStore {
  constructor(io) {
    super();
    this.io = io;
    this.channels = [];
  }

  emitChannelList() {
    const list = this.channels.map(channel => channel.label);
    this.io.emit('channellist', list);
  }

  createChannel(label) {
    const newChannel = {
      id: this.createId(this.channels, 'id'),
      label,
      messages: [],
    };
    this.channels.push(newChannel);
    this.emitChannelList();
  }
}

module.exports = io => new ConversationsStore(io);
