require('dotenv').config();
const app = require('express')();
const httpServer = require('http').createServer(app);
const options = {
  cors: {
    origin: process.env.ALLOWED_ORIGIN,
  },
};
const io = require('socket.io')(httpServer, options);

io.on('connection', socket => {
  console.log('a client connected');
  socket.emit('connection-test', 'Connection works');

  socket.on('disconnect', () => {
    console.log('a client disconnected');
  })
});

app.get('/', (req, res) => {
  res.send(`Currently connected sockets: ${io.of('/').sockets.size}`);
});

const port = process.env.PORT;

httpServer.listen(port, () => {
  console.log(`Server running at port ${port}`);
});
