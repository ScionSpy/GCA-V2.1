const { DbPlayer, DbClanMember } = require('../Classes');
const coreDB = require('../index')
const DB = {};
module.exports = DB;


/**
 * Adds a player to the Database.
 * • If a player exists via ID, the player name will be updated using the provided {player}'s information.
 * @param {DbPlayer} player
 * @returns
 */
DB.createPlayer = async function(player){
    if (typeof player !== 'object') throw new Error(`DB.API.createPlayer(player); TypeError: 'player' must be an object!`);
    if (typeof player.id !== "number") throw new Error(`DB.API.createPlayer(player); TypeError: 'player.id' must be a number!`);
    if (typeof player.name !== "string") throw new Error(`DB.API.createPlayer(player); TypeError: 'player.name' must be a string!`);

    let playerExists = await this.getPlayer(player.id);
    if (!playerExists) {
        return await coreDB._Post("players", player);

    } else {
        player
    };
};


/**
 * Finds a player in the Database and returns the relevant information.
 * @param {String|Number} search A string representing the players name, or Number representing their ID.
 * @param {Object} options Options to provide to enhance the search.
 * @param {Boolean} options.exact Allows exact match on name returns. ('search' must be a string!)
 * @returns {import('./Schemas/dbPlayer')}
 */
DB.getPlayer = async function getPlayer(search, options = { exact: false }){
    if (typeof search !== "string" && typeof search !== "number") throw new Error(`DB.API.getPlayer(search, options); TypeError: 'search' must be a 'string' or 'number'! got '${typeof string}'`);
    if (typeof options !== "undefined" && typeof options !== "object") throw new Error(`DB.API.getPlayer(search, options); TypeError: 'options' must be an object! got '${typeof options}'`);
    if (options) {
        if (options.exact && typeof options.exact !== "boolean") throw new Error(`DB.API.getPlayer(search, options); TypeError: 'options.exact' must be a 'boolean'! got '${typeof options.exact}'`);
    };

    let query;
    if (typeof search === "number"){
        query = { id:search };
    } else if (typeof search === "string") {
        query = { name:search };
    };

    return await coreDB._Get("players", query);
};


/**
 * Updates the 'discord_id' field for a player on the DB.
 * @param {String} discord_id A Discord user_id.
 */
DB.setDiscordId = async function(discord_id){

};
