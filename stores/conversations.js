const BaseStore = require('./base');

class ConversationsStore extends BaseStore {
  constructor(io) {
    super();
    this.io = io;
    this.channels = [];
  }

  emitChannelList(socket) {
    const eventName = 'channel-list';
    const list = this.channels.map(channel => ({ label: channel.label, id: channel.id }));
    if (socket) {
      return socket.emit(eventName, list);
    }
    this.io.emit(eventName, list);
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
