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
  socket.emit('connection-test', 'Connection works');
});

app.get('/', (req, res) => {
  res.send('At root');
});

const port = process.env.PORT;

httpServer.listen(port, () => {
  console.log(`Server running at port ${port}`);
});
