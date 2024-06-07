
export function setupSocket() {
  let counter = 0;
  const socket = io({
    auth: {
      serverOffset: 0
    },
    //enable retries
    ackTimeout: 10000,
    retries: 3,
  });


  const form = document.getElementById('form');
  const input = document.getElementById('input');
  const messages = document.getElementById('messages');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if(input.value) {
      //compute a unique offset
      const clientOffset = `${socket.id}-${counter++}`;
      socket.emit('chat message', input.value, clientOffset);
      input.value = '';
    }
  });





  socket.on('chat message', (msg, serverOffset) => {
    const item = document.createElement('li');
    item.textContent = msg;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
    socket.auth.serverOffset = serverOffset;
  });

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