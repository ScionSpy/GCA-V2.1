const DB_API = require('./DB_API.js');
const API_Client = require('./API/Client.js');
const { _Get, _Post, _Edit, _Delete } = new DB_API();

const API = {
    _Get,
    _Post,
    _Edit,
    _Delete,

    Client: new API_Client(),
    players: require('./API/player.js')

};
module.exports = API;
