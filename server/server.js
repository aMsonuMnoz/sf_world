import express from 'express'
import { createServer } from 'node:http'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { Server } from 'socket.io'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

//open the database file
const db = await open({
  filename: 'chat.db',
  driver: sqlite3.Database
});
//create 'messages' table
await db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_offset TEXT UNIQUE,
  content TEXT
  );
  `);


const app = express();
const server = createServer(app);
const io = new Server(server, {connectionStateRecovery: {}});

const port = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static('public'));

let players = {};

io.on('connection', async (socket) => {
  console.log('a user connected: ', socket.id);

  //Handle Chat Messsage
  socket.on('chat message', async (msg, clientOffset, callback) => {
    let result;
    try {
      //store the messages in the database
      result = await db.run('INSERT INTO messages (content, client_offset) VALUES (?, ?)', msg, clientOffset);
    } catch (e) {
      if (e.errno === 19 /* SQLITE_CONSTRAINT */ ){
        // the message was already inserted
        callback();
      } else {
        // nothing to do, let client retry
      }
      return;

    }
    //include the offset with the message
    io.emit('chat message', msg, result.lastID);
    //acknowledge the event
    callback();
  });

  if (!socket.recovered) {
    //if the connection state recover was not successful
    try {
      await db.each('SELECT id, content FROM messages WHERE id > ?',
        [socket.handshake.auth.serverOffset || 0],
        (_err, row) => {
          socket.emit('chat message', row.content, row.id);
        }
      )
    } catch (e) {
      //something went wrong
    }
  }
  
  // Handle new player
  socket.once('newPlayer', (player) => {
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