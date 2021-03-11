const faker = require('faker');

class UsersStore {
  constructor(io) {
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
    this.io.emit('userlist', this.get());
  }

  getId() {
    return this.users.length < 1
      ? 0
      : this.users.map(user => user.pubId).reduce((acc, curr) => (acc > curr ? acc : curr)) + 1;
  }

  add(socket) {
    const newUser = {
      name: faker.name.firstName(),
      pubId: this.getId(),
      socket,
    };
    this.users.push(newUser);
    this.emit();
  }

  remove(socket) {
    this.users = this.users.filter(user => user.socket.id !== socket.id);
    this.emit();
  }
}

module.exports = io => new UsersStore(io);
