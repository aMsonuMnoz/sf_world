let players = {};

function addPlayer(id, player) {
  players[id] = player;
}

function removePlayer(id) {
  delete players[id];
}

function updatePlayerPosition(id, data) {
  if (players[id]) {
    players[id].x = data.x;
    players[id].y = data.y;
  }
}

function getPlayers() {
  return players;
}

module.exports = {
  addPlayer,
  removePlayer,
  updatePlayerPosition,
  getPlayers
};