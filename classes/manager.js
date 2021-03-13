const BaseStore = require('./base-store');
const Conversation = require('./conversation');
const UsersStore = require('./users-store');

// events
const userslistChange = 'user-list',
  channelslistChange = 'channel-list',
  peopleTyping = 'users-typing',
  newSequence = 'new-sequence';

class Manager extends BaseStore {
  constructor(io) {
    super();
    this.io = io;
    this.channels = [];
    this.users = new UsersStore();
  }

  getPublicChannelList = () =>
    this.channels.map(channel => ({
      id: channel.id,
      label: channel.meta.label,
    }));

  emitSequence(conversation) {
    const room = conversation.id.toString();
    const sequence = conversation.getSequence();
    this.io.to(room).emit(newSequence, sequence, conversation.id);
  }

  createChannel(label) {
    // should validate label
    const newId = this.createId(this.channels, 'id');
    const meta = {
      type: 'channel',
      label,
    };
    this.channels.push(new Conversation(newId, meta));
    this.io.emit(channelslistChange, this.getPublicChannelList());
  }

  findChannel(id) {
    return this.channels.find(channel => channel.id === id);
  }

  newChannelMessage(socket, textContent) {
    // spam check, is user allowed to type?
    const matchedUser = this.users.findUser(socket);
    if (matchedUser) {
      const matchedChannel = this.findChannel(matchedUser.hiddenFields.activeConversation);
      if (matchedChannel) {
        matchedChannel.addMessage(matchedUser.id, textContent);
        this.users.cancelTyping(socket, id => this.emitPeopleTyping(id));
        this.io.emit('new-channel-message', matchedChannel.id);
        this.emitSequence(matchedChannel);
      }
    }
  }

  retrieveChannelMessage(channelId, messageId) {
    const matchedChannel = this.findChannel(channelId);
    if (matchedChannel) {
      return matchedChannel.getMessage(messageId);
    }
    return null;
  }

  handleSocketConnect(socket) {
    this.users.add(socket);
    socket.emit('user-id', this.users.findUser(socket).id);
    socket.join('0');
    const mainChannel = this.findChannel(0);
    socket.emit(newSequence, mainChannel.getSequence(), 0);
    socket.emit(channelslistChange, this.getPublicChannelList());
    this.io.emit(userslistChange, this.users.getPublicList());
  }

  handleSocketDisconnect(socket) {
    this.users.remove(socket);
    this.io.emit(userslistChange, this.users.getPublicList());
  }

  emitPeopleTyping(conversationId) {
    const peopleTypingArray = this.users.getAllActiveInRoom(conversationId);
    const room = conversationId.toString();
    this.io.to(room).emit(peopleTyping, peopleTypingArray);
  }

  handleIsTyping(socket) {
    this.users.triggerIsTyping(socket, id => this.emitPeopleTyping(id));
  }

  handleChannelSwitch(socket, channelId) {
    const matchedChannel = this.findChannel(channelId);
    if (matchedChannel) {
      socket.leaveAll();
      socket.join(channelId.toString());
      socket.emit(newSequence, matchedChannel.getSequence(), matchedChannel.id);
      socket.emit(peopleTyping, this.users.getAllActiveInRoom(channelId));
      this.users.cancelTyping(socket, id => this.emitPeopleTyping(id));
      this.users.setActiveConversation(socket, channelId);
    }
  }

  handleNameChange(socket, newName) {
    this.users.updateName(socket, newName);
    this.io.emit(userslistChange, this.users.getPublicList());
  }

  serveMessage(channelId, messageId, callback) {
    const channelMatch = this.findChannel(channelId);
    if (channelMatch) {
      const messageMatch = channelMatch.getMessage(messageId);
      if (messageMatch) {
        return callback(messageMatch);
      }
    }
    console.log(channelId, messageId);
    callback(null);
  }
}

module.exports = io => new Manager(io);
