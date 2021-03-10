require('dotenv').config();
const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.send('At root');
});

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Server running at port ${port}`);
});
