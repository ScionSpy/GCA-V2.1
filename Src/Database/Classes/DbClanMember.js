const Player = require('./DbPlayer.js');
const Logger = require('../../Structures/Logger/logger.js');

const { ClanMemberSchema } = require('../Schemas/index.js');
const { RANKS, POSITION } = require('../../Discord/Helpers/clan_ranks.js');


/**
 *
 * @param {ClanMemberSchema} player
 */
const Validator = function(player){
    if (typeof player.clan.clan_id !== "number") {
        throw new TypeError(`'player.clan_id' must be a number!`);
    };

    if (!RANKS.includes(player.clan.rank) && !RANKS.includes(player.clan.role)) {
        throw new Error(`player.clan.rank ('${player.clan.rank}') / player.clan.role ('${player.clan.role}') are not valid clan ranks!`);
    };
    if (typeof player.clan.joined !== "number" && typeof player.clan.joined_at !== "number") {
        throw new TypeError(`'player.joined' or 'player.joined_at' must be a number! got ${typeof player.clan.joined} / ${typeof player.clan.joined_at}`);
    };
};

/**
 * Represnts a Player, with a Clan saved on the Database.
 * @type {ClanMemberSchema}
 */
module.exports = class ClanMember extends Player {

    /** @type {Logger|Null} */
    #logger = null;

    clan_id = 0;
    rank = "";
    joined = 0;

    /**
     * @param {ClanMemberSchema} player
     */
    constructor(player){
        super(player);
        Validator(player);

        this.#logger = new Logger(`ClanMember<${this.id}>`);

        this.clan_id = player.clan.clan_id;
        this.rank = player.clan.rank || player.clan.role;
        this.joined = player.clan.joined || player.clan.joined_at;

        this.#logger.debug('loaded ClanMember.');
    };


    /**
     *
     * @param {Number|Null} clan_id Clan ID this player joined, or null if left.
     * @param {Number} timestamp Time at which the member joined the clan, or Time at which the bot noticed member left their clan.
     */
    async setClan(clan_id, timestamp){
        this.#logger.logSettings(`Member.setClan(); Updated clan from ${this.clan_id} to ${clan_id} ${clan_id ? 'Joined at' : 'Left at'} ${timestamp}`);

        this.clan_id = clan_id;
        return await this.save();
    };


    async setRank(newRank) {
        this.#logger.logSettings(`Member.setClan(); Updated clan rank from ${this.rank} (${POSITION[this.rank]}) to ${newRank} (${POSITION[this.rank]})`);

        this.rank = newRank;
        return await this.save();
    };

};
