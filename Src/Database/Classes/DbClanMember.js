const Player = require('./DbPlayer.js');
const Logger = require('../../Structures/Logger/logger.js');

const { ClanMemberSchema } = require('../Schemas/dbClanMember.js');

/**
 * @typedef {"private" | "officer" | "commissioned_officer" | "recruitment_officer" | "executive_officer" | "commander"} RankList
*/


/**
 *
 * @param {ClanMemberSchema} player
 */
const Validator = function(player){
    if (typeof player.clan_id !== "number") {
        throw new TypeError(`'player.clan_id' must be a number!`);
    };

    if (!Object.prototype.hasOwnProperty.call(RankList, player.clan.rank)) {
        throw new Error(`player.rank ('${player.clan.rank}') is not a valid clan rank!`);
    };
    if (typeof player.clan.joined !== "number") {
        throw new TypeError(`'player.joined' must be a number! got ${typeof player.clan.joined}`);
    };
};

/**
 * Represnts a Player, with a Clan saved on the Database.
 * @type {ClanMemberSchema}
 */
module.exports = class ClanMember extends Player {

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
        this.rank = player.clan.rank;
        this.joined = player.clan.joined;

        this.#logger.debug('loaded ClanMember.');
    };


};
