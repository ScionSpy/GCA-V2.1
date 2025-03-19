const DB = require('../index.js');

const GuildMember = require('discord.js').GuildMember;
const DiscordGuild = require('discord.js').Guild;
const BotClient = require('./BotClient.js');
//const Clan = require('./Clan/_Clan.js');


const { DEFAULT_PREFIX } = require("../../../config.js");

/**
 * @typedef {Object} GuildData
 * @property {String} name Guild Name
 * @property {GuildMember} owner Guild Owner
 * @property {Date} joinedAt Date upon the Client joining the server.
 * @property {Date} leftAt Date upon the Client leaving the server.
 * @property {Number} bots How many bots on the server?
 */

/**
 * @typedef {Object} TicketCategories
 * @property {Boolean} id
 * @property {String} name
 * @property {Array<String>} staff_roles
 */

/**
 * @typedef {Object} Ticket
 * @property {String} ticket.log_channel
 * @property {Number} ticket.limit
 * @property {Array<TicketCategories>} ticket.categories
 */

/**
 * @typedef {Object} GuildType
 * @property {String} id Guild ID
 * @property {GuildData} data Guild info
 * @property {String} prefix Client Custom Prefix on this Guild.
 *
 * @property {Ticket} ticket Information regarding the ticket system.
 */



module.exports = class Guild {

    /** @type {BotClient} */
    #bot;
    /** @type {DiscordGuild} */
    #guild;
    #status; // Wether the bot is in this server or not.
    id;
    prefix = DEFAULT_PREFIX;
    channels = {};

    clan_id;
    #invite;
    #clan;

    constructor(){};
};
