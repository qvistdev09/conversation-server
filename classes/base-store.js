class BaseStore {
  createId(array, string) {
    return array.length < 1 ? 0 : array.map(item => item[string]).reduce((acc, curr) => (acc > curr ? acc : curr)) + 1;
  }
}

module.exports = BaseStore;