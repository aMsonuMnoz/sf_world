const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static('public'));

let players = {};

io.on('connection', (socket) => {
  console.log('a user connected: ', socket.id);
  
  // Handle new player
  socket.on('newPlayer', (player) => {
    players[socket.id] = player;
    io.emit('updatePlayers', players);
  });
  
  // Handle player movement
  socket.on('movePlayer', (data) => {
    if (players[socket.id]) {
      players[socket.id].x = data.x;
      players[socket.id].y = data.y;
      io.emit('updatePlayers', players);
    }
  });

  // Handle player disconnect
  socket.on('disconnect', () => {
    delete players[socket.id];
    io.emit('updatePlayers', players);
    console.log('user disconnected: ', socket.id);
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});