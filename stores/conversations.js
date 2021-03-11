class ConversationsStore {
  constructor(io) {
    this.io = io;
    this.channels = [];
  }

  emitChannelList() {
    const list = this.channels.map(channel => channel.label);
    this.io.emit('channellist', list);
  }

  getId(conversationsArray) {
    return conversationsArray.length < 1
      ? 0
      : conversationsArray.map(conversation => conversation.id).reduce((acc, curr) => (acc > curr ? acc : curr)) + 1;
  }

  createChannel(label) {
    const newChannel = {
      id: this.getId(this.channels),
      label,
      messages: [],
    };
    this.channels.push(newChannel);
    this.emitChannelList();
  }
}

module.exports = io => new ConversationsStore(io);
