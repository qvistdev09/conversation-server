const faker = require('faker');
const BaseStore = require('./base');

class UsersStore extends BaseStore {
  constructor(io) {
    super();
    this.io = io;
    this.users = [];
  }

  get() {
    return this.users.map(user => ({
      name: user.name,
      pubId: user.pubId,
    }));
  }

  emit() {
    this.io.emit('user-list', this.get());
  }

  createName() {
    const adjective = faker.commerce.productAdjective().toLowerCase();
    const noun = faker.commerce.product().toLowerCase();
    return `${adjective}-${noun}`.replace(' ', '-');
  }

  add(socket) {
    const newUser = {
      name: this.createName(),
      pubId: this.createId(this.users, 'pubId'),
      socket,
      activeConversation: 0,
    };
    this.users.push(newUser);
    this.emit();
  }

  setActiveConversation(socket, id) {
    const userMatch = this.users.find(user => user.socket.id === socket.id);
    if (!userMatch) {
      return;
    }
    userMatch.activeConversation = id;
    console.log(userMatch.name, userMatch.activeConversation);
  }

  remove(socket) {
    this.users = this.users.filter(user => user.socket.id !== socket.id);
    this.emit();
  }
}

module.exports = io => new UsersStore(io);
