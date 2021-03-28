const { emitter } = require('../chat-emitter');
const randomColor = require('randomcolor');

class Bot {
  constructor(id, name, sendMessageFunction, createChannelFunction) {
    this.id = id;
    this.isBot = true;
    this.openFields = {
      name,
      online: true,
      color: randomColor(),
      icon: 10,
    };
    this.hiddenFields = {
      isTyping: false,
      activeConversation: 0,
      actionTimeout: null,
      performingSequence: false,
    };
    this.sendMessageFunction = sendMessageFunction;
    this.createChannelFunction = createChannelFunction;

    this.greetingSequence = [
      {
        action: (...args) => this.wait(...args),
        args: { ms: 3000 },
      },
      {
        action: (...args) => this.sendMessage(...args),
        args: { string: 'Hi there!' },
      },
      {
        action: (...args) => this.wait(...args),
        args: { ms: 1500 },
      },
      {
        action: (...args) => this.sendMessage(...args),
        args: { string: 'Welcome to Conversations, a tiny chat app made by Oscar Lindqvist' },
      },
      {
        action: (...args) => this.wait(...args),
        args: { ms: 3000 },
      },
      {
        action: (...args) => this.sendMessage(...args),
        args: { string: "My name is Tiny-Bot, and I'm here to explain the features of this app" },
      },
      {
        action: (...args) => this.wait(...args),
        args: { ms: 2500 },
      },
      {
        action: (...args) => this.sendMessage(...args),
        args: {
          string:
            'Each user is assigned a random name - but you can change it if you want to! Just click on your name in the upper right corner, to the left of your avatar',
        },
      },
    ];
  }

  get publicInfo() {
    return {
      id: this.id,
      ...this.openFields,
    };
  }

  startTyping() {
    this.hiddenFields.isTyping = true;
    emitter.toRoom(this.hiddenFields.activeConversation.toString(), 'user-started-typing', this.id);
  }

  stopTyping() {
    this.hiddenFields.isTyping = false;
    emitter.toRoom(this.hiddenFields.activeConversation.toString(), 'user-stopped-typing', this.id);
  }

  clearAction() {
    clearTimeout(this.hiddenFields.actionTimeout);
  }

  sendMessage({ string }, next) {
    console.log('sendmessage called');
    const delay = string.length * 100;
    this.startTyping();
    this.clearAction();
    this.hiddenFields.actionTimeout = setTimeout(() => {
      this.stopTyping();
      this.sendMessageFunction(this.hiddenFields.activeConversation, this.id, string);
      if (next) {
        next();
      }
    }, delay);
  }

  wait({ ms }, next) {
    this.clearAction();
    this.hiddenFields.actionTimeout = setTimeout(() => {
      if (next) {
        next();
      }
    }, ms);
  }

  startSequence(sequence, index) {
    console.log('started', index);
    this.hiddenFields.performingSequence = true;
    const nextAction = sequence[index + 1]
      ? () => this.startSequence(sequence, index + 1)
      : () => {
          this.hiddenFields.performingSequence = false;
        };
    sequence[index].action(sequence[index].args, nextAction);
  }
}

module.exports = Bot;
