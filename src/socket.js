import { controls } from './game.js'
export function setupSocket() {
  let counter = 0;
  const socket = io({
    auth: {
      serverOffset: 0
    }
  });


  const form = document.getElementById('form');
  const input = document.getElementById('input');
  const messages = document.getElementById('messages');
  const okButton = document.getElementById('prompt-ok-button');
  const promptInput = document.getElementById('prompt-input');
  const modal = document.getElementById('custom-prompt');
  const promptMessage = document.getElementById('prompt-message');


  // screen name prompt submit
  okButton.addEventListener('click', async () => {
    if(promptInput.value){
      const clientOffset = `${socket.id}-${counter++}`;
      promptMessage.textContent = "Connecting..."
      socket.emit('setScreenName', promptInput.value, clientOffset);
    }
  });


  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if(input.value) {
      //compute a unique offset
      const clientOffset = `${socket.id}-${counter++}`;
      socket.emit('chat message', input.value, clientOffset);
      input.value = '';
      input.blur();
      controls.lock();
    }
  });


  document.addEventListener('keydown', (event) => {
    if(modal.style.display === 'none'){
      if((event.key === 't' || event.key === 'T') && (document.activeElement !== input)){
        input.focus();
        event.preventDefault();
        controls.unlock();
      }

      if(event.key === 'Backspace'){
        if(!input.value){
          input.blur();
          event.preventDefault();
          controls.lock();
        }
      }
    }
  })


  socket.on('screenNameSet', (response) => {
    if(response){
      modal.style.display = 'none';
    }
    else{
      promptMessage.textContent = 'Error setting screen name, please try again'
    }
  });



  socket.on('chat message', (msg, serverOffset) => {
    const item = document.createElement('li');
    item.textContent = msg;
    messages.appendChild(item);
    messages.scrollTo(0, messages.scrollHeight);
    socket.auth.serverOffset = serverOffset;
    console.log('why');
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


  window.addEventListener('beforeunload', () => {
    socket.emit('counter', counter);
  });
}