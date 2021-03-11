const faker = require('faker');

let users = [];

const getId = () =>
  users.length < 1 ? 0 : users.map(user => user.pubId).reduce((acc, curr) => (acc > curr ? acc : curr)) + 1;

const addUser = socket => {
  const newUser = {
    name: faker.name.firstName(),
    pubId: getId(),
    socket,
  };
  users.push(newUser);
};

const removeUser = socket => {
  users = users.filter(user => user.socket.id !== socket.id);
}

const getUsers = () => users.map(user => ({
  name: user.name,
  pubId: user.pubId,
}));

module.exports = { addUser, removeUser, getUsers };
