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

  emitChannelMessages(id, socket) {
    const channelMatch = this.channels.find(channel => channel.id === id);
    if (!channelMatch) {
      return;
    }

    const eventName = 'channel-message';
    const messages = channelMatch.messages;

    if (socket) {
      return socket.emit(eventName, messages);
    }
    this.io.emit(eventName, messages);
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

  addMessage(data) {
    const channelMatch = this.channels.find(channel => channel.id === data.id);
    if (channelMatch) {
      const newMessage = {
        id: this.createId(channelMatch.messages, 'id'),
        text: data.text,
      };
      channelMatch.messages.push(newMessage);
      this.emitChannelMessages(data.id);
    }
  }
}

module.exports = io => new ConversationsStore(io);
