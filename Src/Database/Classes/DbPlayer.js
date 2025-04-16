const Database = require('../DB_API.js');
const Logger = require('../../Structures/Logger/logger.js');

const { PlayerSchema } = require('../Schemas/index.js');

/**
 * Validates a Player Object before returning it as a class.
 * @param {PlayerSchema} player
 */
const Validator = function(player){
    if (typeof player !== "object") {
        throw new TypeError(`'player' must be an object! got ${typeof player}`);
    };

    if (typeof player.id !== "number" && typeof player.account_id !== "number") {
        throw new TypeError(`'player.id' or 'player.account_id' must be a number! got ${typeof player.id} / ${typeof player.account_id}`);
    };
    if (typeof player.name !== "string" && typeof player.nickname !== "string") {
        throw new TypeError(`'player.name' or 'player.nickname' must be a string! got ${typeof player.name} / ${typeof player.nickname}`);
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

    /** @type {Logger|Null} */
    #logger;

    id = 0;
    name = "";

    discord_id = "";


    /** @type {Number} */
    #lastLogout
    /** @type {Number} */
    #lastBattleTime

    /**
     *
     * @param {PlayerSchema} player
     */
    constructor(player){
        Validator(player);
        super();

        this.#logger = new Logger(`Player<${player.id}>`);

        this.id = player.id || player.account_id;
        this.name = player.name || player.nickname;
        this.#lastBattleTime = player.lastBattleTime || player.last_battle_time;
        this.#lastLogout = player.lastLogout || player.logout_at

        if(player.discord_id) this.discord_id = player.discord_id;

        this.#logger.debug('loaded player.');
    };


    /**
     * Update the Player's Name.
     * @param {String} newName This Player's new Name.
     * @returns {Player}
     */
    async setName(newName) {
        if (!newName || typeof newName !== "string") throw new Error(`Player.setName(newName); 'newName' must be a string! got ${typeof newName} : ${newName}`);
        this.#logger.logSettings(` setName(); Update player name from [ ${this.name} ] to [ ${newName} ]`);

        this.name = newName;
        return await this.save();
    };





    async setLastLogout(logoutTime) {
        if (!logoutTime || typeof logoutTime !== "number") throw new Error(`Player.setLastLogout(logoutTime); 'logoutTime' must be a number! got ${typeof logoutTime} : ${logoutTime}`);
        // Do not log this edit.

        this.#lastLogout = logoutTime;
        return await this.save();
    };


    async setLastBattleTime(battleTime) {
        if (!battleTime || typeof battleTime !== "number") throw new Error(`Player.setLastBattleTime(battleTime); 'battleTime' must be a number! got ${typeof battleTime} : ${battleTime}`);
        // Do not log this edit.

        this.#lastBattleTime = battleTime;
        return await this.save();
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



    /**
     * Get's this player's last battle time.
     * @returns {Number}
     */
    getLastLogout() {
        return this.#lastLogout;
    };


    /**
     * Get's this player's last battle time.
     * @returns {Number}
     */
    getLastBattleTime(){
        return this.#lastBattleTime;
    };
};
