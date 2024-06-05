
export function setupSocket() {
  const socket = io();

  socket.on('connect', () => {
    console.log('Connected to server');
    socket.emit('newPlayer', { x: 0, y: 0 });
  });

  socket.on('updatePlayers', (players) => {
    console.log(players);
    // Update game state with new players data
  });

  function movePlayer(x, y) {
    socket.emit('movePlayer', { x, y });
  }
}