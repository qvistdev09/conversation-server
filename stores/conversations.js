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

  emitMessages(conversationId, socket) {
    const conversationMatch = this.channels.find(channel => channel.id === conversationId);
    if (!conversationMatch) {
      return;
    }

    const eventName = 'channel-message';
    const messages = conversationMatch.messages;

    if (socket) {
      return socket.emit(eventName, messages)
    }

    const roomId = conversationId.toString();
    this.io.to(roomId).emit(eventName, messages);
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
    const conversationMatch = this.channels.find(channel => channel.id === data.id);
    if (conversationMatch) {
      const newMessage = {
        id: this.createId(conversationMatch.messages, 'id'),
        text: data.text,
      };
      conversationMatch.messages.push(newMessage);
      this.emitMessages(data.id);
    }
  }
}

module.exports = io => new ConversationsStore(io);
