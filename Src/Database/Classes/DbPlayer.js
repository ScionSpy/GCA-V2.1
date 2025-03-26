const Database = require('../DB_API.js');
const Logger = require('../../Structures/Logger/logger.js');

const { PlayerSchema } = require('../Schemas/dbPlayer.js');

/**
 * Validates a Player Object before returning it as a class.
 * @param {PlayerSchema} player
 */
const Validator = function(player){
    if (typeof player !== "object") {
        throw new TypeError(`'player' must be an object! got ${typeof player}`);
    };

    if (typeof player.id !== "number") {
        throw new TypeError(`'player.id' must be a number! got ${typeof player.id}`);
    };
    if (typeof player.name !== "string") {
        throw new TypeError(`'player.name' must be a string! got ${typeof player.name}`);
    };

    if (player.discord_id && typeof player.discord_id !== "string" && isNaN(player.discord_id)) {
        throw new TypeError(`'player.discord_id' if provided, must be a number as a String representing a Discord user_id. got ${typeof player.discord_id} : ${player.discord_id}`);
    };


};

/**
 * Represnts a Player saved on the Database.
 * @type {PlayerSchema}
 */
module.exports = class Player extends Database {

    #logger;

    id = 0;
    name = "";
    discord_id = "";

    /**
     *
     * @param {PlayerSchema} player
     */
    constructor(player){
        Validator(player);

        this.#logger = new Logger(`Player<${this.id}>`);

        this.id = player.id;
        this.name = player.name;

        if(player.discord_id) this.discord_id = player.discord_id;

        this.#logger.debug('loaded player.');
    };

    /**
     * Updates this player's Discord ID on the database.
     * @param {String} discord_id
     * @returns {Player}
     */
    __setDiscordId(discord_id){
        if (!discord_id || typeof discord_id !== "String" || isNaN(discord_id)) throw new Error(`Database.Player.setDiscordId(discord_id); 'discord_id' must be a String represetning a Discord user id. got ${typeof discord_id} : ${discord_id}`);

        let old_value = this.discord_id;
        this.discord_id = discord_id;
        this._Edit("players", { id: this.id, discord_id});

        this.#logger.hiddenLog(`updated discord_id ${old_value} to ${this.discord_id}`);
        return this;
    };
};
