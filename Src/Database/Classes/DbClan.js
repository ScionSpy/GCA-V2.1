const Database = require('../core.js');
const { ClanSchema } = require('../Schemas/index.js');
const { Clan_Info } = require('../../WebAPI/Wargaming/Structures/ClanData.js');

/**
 * @param {ClanSchema | Clan_Info} clan
 */
const Validator = function(clan){
    if (typeof clan !== "object") {
        throw new TypeError(`'clan' must be an object!`);
    };
    if (typeof clan.clan_id !== "number") {
        throw new TypeError(`'clan.clan_id' must be a number! got ${typeof clan.clan_id}`);
    };
    if (typeof clan.name !== "string") {
        throw new TypeError(`'clan.name' must be a string! got ${typeof clan.name}`);
    };
    if (typeof clan.tag !== "string") {
        throw new TypeError(`'clan.tag' must be a string! got ${typeof clan.tag}`);
    };
    if (typeof clan.is_clan_disbanded !== "boolean") {
        throw new TypeError(`'clan.is_clan_disbanded' must be a boolean! got ${clan.is_clan_disbanded}`);
    };


    if (typeof clan.leader !== "number" && typeof clan.leader_id !== "number") {
        throw new TypeError(`either 'clan.leader' or 'clan.leader_id' must be a number!`);
    };
    if (typeof clan.founder !== "number" && typeof clan.creator_id !== "number") {
        throw new TypeError(`either 'clan.founder' or 'clan.creator_id' must be a number!`);
    };

    if (
        clan.members_ids &&
        (
            !Array.isArray(clan.members_ids) ||
            clan.members_ids.some((id) => typeof id !== "number")
        )
    ) {
        throw new TypeError(`'clan.members' must be an array of numbers`);

    };


    if (clan.members) {
        if (!Array.isArray(clan.members) || typeof clan.members !== "object") {
            throw new TypeError(`'clan.members' must be an object or an array! got ${typeof clan.members}`);
        };

        if (Array.isArray(clan.members) && typeof clan.members[0] === "number") {
            throw new TypeError(`'clan.members' must be an array of numbers!`);

        } else if (Array.isArray(clan.members)) {
            // clan received is from the API.

            for (const x = 0; x < clan.members.length; x++) {
                let member = clan.members[x];

                if (typeof member !== 'object') {
                    throw new TypeError(`'clan.members' must include only objects! got ${typeof member}`);
                };

                if (typeof member.account_id !== "number") {
                    throw new TypeError(`'member.id' must be a number! got ${typeof member.id}`);
                };
                if (typeof member.role !== "string") {
                    throw new TypeError(`'member.rank' must be a string! got ${typeof member.rank}`);
                };
                if (typeof member.joined_at !== "number") {
                    throw new TypeError(`'member.joined' must be a number! got ${typeof member.joined}`);
                };
            };

        } else {
            // clan recieved is from the DB or a Class.

            for (const key in clan.members) {
                let member = clan.members[key];

                if (typeof member !== 'object') {
                    throw new TypeError(`'clan.members' must include only objects! got ${typeof member}`);
                };

                if (typeof member.id !== "number") {
                    throw new TypeError(`'member.id' must be a number! got ${typeof member.id}`);
                };
                if (typeof member.rank !== "string") {
                    throw new TypeError(`'member.rank' must be a string! got ${typeof member.rank}`);
                };
                if (typeof member.joined !== "number") {
                    throw new TypeError(`'member.joined' must be a number! got ${typeof member.joined}`);
                };
            };
        };
    }; // end clan.members

};


/**
 * Represents a Clan within World of Warships.
 * @type {ClanSchema}
 */
module.exports = class Clan extends Database {

    #logger = null;

    id = 0;
    name = "";
    tag = "";

    leader = 0;
    founder = 0;
    members = [Number()];

    /**
     * @param {Clan_Info | ClanSchema } clan
     */
    constructor(clan){
        Validator(clan);
        this.#logger = new Logger(`Clan<${this.clan_id}>`);

        this.clan_id = clan.clan_id || clan.id;
        this.name = clan.name;
        this.tag = clan.tag;

        this.leader = clan.leader || clan.leader_id;
        this.founder = clan.founder || clan.creator_id;

        if (Array.isArray(clan.members) && typeof clan.members[0] === "number") {
            this.members = clan.members;

        } else if (Array.isArray(clan.members)) {

            // API Members list.
            this.members = [];
            for (let x = 0; x < clan.members.length; x++) {
                let member = clan.members[x];
                this.members.push(member.account_id);
            };

        } else {
            // DB Members list.

            this.members = [];
            for (const Member in clan.members) {
                let member = clan.members[Member];
                this.members.push(member.id);
            };
        };

        this.#logger.debug(`clan loaded.`);
    };
};
