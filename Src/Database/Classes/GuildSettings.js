const Database = require('../core.js');
const DiscordGuild = require('discord.js').Guild;
const { GuildSettingsSchema } = require('../Schemas/GuildSettings.js');
const BotClient = require('../../Discord/Structures/BotClient.js');
//const Clan = require('./Clan/_Clan.js');


const { DEFAULT_PREFIX } = require("../../../config.js");

module.exports = class Guild extends Database {

    /** @type {BotClient} */
    #bot;
    /** @type {DiscordGuild} */
    #guild;
    #available; // Wether the bot is in this server or not.
    id;
    prefix = DEFAULT_PREFIX;
    channels = {};

    clan_id;
    #invite;
    #clan;


    /**
     *
     * @param {DiscordGuild} guild
     */
    constructor(guild){
        guild
    };
};
