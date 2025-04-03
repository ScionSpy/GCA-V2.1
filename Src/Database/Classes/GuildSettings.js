const Database = require('../core.js');
const Logger = require('../../Structures/Logger/logger.js');
const DiscordGuild = require('discord.js').Guild;
const {GuildSettingsSchema} = require('../Schemas/index.js')
const BotClient = require('../../Discord/Structures/BotClient.js');
//const Clan = require('./Clan/_Clan.js');


const { PREFIX } = require("../../../config.js");

module.exports = class Guild extends Database {

    #logger;

    /** @type {BotClient} */
    #bot;
    /** @type {DiscordGuild} */
    #guild;
    #available; // Wether the bot is in this server or not.
    id;
    prefix = PREFIX;
    channels = {};

    clan_id;
    #invite;
    #clan;


    /**
     *
     * @param {DiscordGuild} guild
     */
    constructor(guild){
        // Temporary until {Validator} function is created.
        if (!guild || !guild.client) throw new Error(`new Database.Guild(guild, client); both 'guild' and 'client' must be defined!`);
        //Validator(guild, client);
        super();

        this.#logger = new Logger(`Guild<${guild.id}>`);

        this.id = guild.id;
        this.#guild = guild;
        /** @type {import('../../Structures/BotClient.js')} */
        this.#bot = guild.client;
        this.available = guild.available;

        this.loadSettings(guild);
    };

    async save(){
        let data = {
            prefix: this.prefix,
            available: this.available
        };

        if (this.clan_id) data.clan_id = this.clan_id;
        if (this.#invite) data.invite = this.#invite;


        try {
            await this._Edit("GuildSettings", {id:this.id}, data);
            return true;
        } catch (err) {
            throw new Error(err);
        };
    };

    /**
     *
     * @returns {Guild}
     */
    async loadSettings(guild) {
        delete this.loadSettings;

        /** @type {GuildSettingsSchema} */
        let settings = await this._Get("GuildSettings", {id:this.id});
        if (!settings) {
            await this.save();
            if (this.#bot.supportServer) await this.#bot.supportServer.joinedGuild(guild);
            return this;
        };

        this.prefix = settings.prefix;
        this.available = settings.available;
        if (settings.clan_id) this.clan_id = settings.clan_id;
        if (settings.invite) this.#invite = settings.invite;

        return this;
    };


    /**
     *
     * @param {String} newPrefix
     * @param {import('discord.js').User} author
     */
    async setPrefix(newPrefix, author){
        this.prefix = newPrefix;

        return this;
    };
};
