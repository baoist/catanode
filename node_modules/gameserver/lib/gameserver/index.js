var Games;

function Games() {
  this.minimum = 0;
  this.maximum = 10000;
  this.list = {};
  this.new_allowed = true;
}

Games.prototype.create = function(id) {
  if (this.new_allowed === false) {
    return 'No new games may be created';
  }

  var game_id = this.unused(id);

  this.list[game_id] = {
    status: 'lobby',
    players: { slot_1: { name: '', occupied: false, icon: 'http://placekitten.com/400/400', identifier: 0, ip: 0 }, 
               slot_2: { name: '', occupied: false, icon: 'http://placekitten.com/400/400', identifier: 0, ip: 0 }, 
               slot_3: { name: '', occupied: false, icon: 'http://placekitten.com/400/400', identifier: 0, ip: 0 }, 
               slot_4: { name: '', occupied: false, icon: 'http://placekitten.com/400/400', identifier: 0, ip: 0 }},
    lobby: [] // for those who are allowed to talk in server.

  };
  return game_id;
};

Games.prototype.unused = function(id) {
  // make sure requested game is within minimum and maximum.
  if(this.minimum > id || this.maximum < id) {
    id = undefined;
  }

  var game_id = id || Math.floor(Math.random() * this.maximum);

  // 10% leeway of game creation only 90% of potential ports may be used.
  if (Object.keys(this.list).length === this.maximum - (this.maximum / 10)) {
    this.new_allowed = false;
  }

  // request new game if selected game id is already taken.
  if (this.list[game_id] != null) {
    return this.unused();
  }
  return game_id;
};

Games.prototype.add_lobby = function(game_id, ip, id, name) {
  if (this.list[game_id].lobby[name] != null) {
    console.log('User exists.');
    return false;
  }

  this.list[game_id].lobby[name] = { ip: ip, id: id, name: name };

  return this.list[game_id].lobby[name];
}

Games.prototype.add_player = function(game_id, slot, name) {
  var req_slot = this.list[game_id].players['slot_' + slot];

  if (this.list[game_id] == null || req_slot == null || req_slot.occupied) {
    console.log('Issue found when joining game.');
    return false;
  }

  req_slot.occupied = true;
  req_slot.name = name;
  return req_slot;
}

Games.prototype.in_lobby = function(game_id, client_id) {
  if(!this.list[game_id]) {
    return false;
  }

  var key, exists = false;
  for (key in this.list[game_id].lobby) {
    if(this.list[game_id].lobby[key].id === client_id) {
      exists = key;
    }
  }
  
  return exists;
}

Games.prototype.purge_lobby = function(game_id, name) {
  if(!this.list[game_id] || !this.list[game_id].lobby[name]) {
    return false;
  }

  delete this.list[game_id].lobby[name];
};

module.exports = Games;
