const coreDB = require('./index.js');
const DB = {
    _core: coreDB,
    players: require('./API/player.js')

};
module.exports = DB;
