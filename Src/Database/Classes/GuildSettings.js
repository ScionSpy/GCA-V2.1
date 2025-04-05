const Database = require('../core.js');
const Logger = require('../../Structures/Logger/logger.js');
const DiscordGuild = require('discord.js').Guild;
const {GuildSettingsSchema} = require('../Schemas/index.js')
const BotClient = require('../../Discord/Structures/BotClient.js');
//const Clan = require('./Clan/_Clan.js');


const { PREFIX } = require("../../../config.js");

module.exports = class GuildSettings extends Database {

    #logger;

    /** @type {BotClient} */
    #bot;
    /** @type {DiscordGuild} */
    #guild;
    #available; // Wether the bot is in this server or not.
    id;
    name;
    prefix = PREFIX;
    channels = {};

    clan_id;
    #invite;
    #clan;


    /**
     *
     * @param {DiscordGuild} guild
     */
    constructor(guild, presetSettings){
        // Temporary until {Validator} function is created.
        if (!guild || !guild.client) throw new Error(`new Database.Guild(guild); both 'guild' and 'guild.client' must be defined!`);
        //Validator(guild, client);
        super();

        this.#logger = new Logger(`Guild<${guild.id}>`);

        this.id = guild.id;
        this.name = guild.name;
        this.#guild = guild;

        /** @type {import('../../Structures/BotClient.js')} */
        this.#bot = guild.client;
        this.available = guild.available;

        this.loadSettings(presetSettings);
    };

    async save(){
        let data = {
            id: this.id,
            name: this.name,
            prefix: this.prefix,
            available: this.available
        };

        if (this.clan_id) data.clan_id = this.clan_id;
        if (this.#invite) data.invite = this.#invite;


        try {
            await this._Edit("GuildSettings", {id:this.id}, data);
            return this;
        } catch (err) {
            throw new Error(err);
        };
    };

    /**
     *
     * @returns {Guild}
     */
    async loadSettings(presetSettings) {
        delete this.loadSettings;

        /** @type {GuildSettingsSchema} */
        let settings;

        if (!presetSettings) {
            settings = await this._Get("GuildSettings", {id:this.id});
            if (settings && settings[0]) settings = settings[0];
        } else settings = presetSettings;

        if (!settings) {
            await this.save();
            return this;
        };


        this.prefix = settings.prefix ? settings.prefix : PREFIX;
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
    async setPrefix(newPrefix, author) {
        this.#logger.logSettings(` SETTINGS.setPrefix(); Guild_ID: ${this.id}\n>> (${author.id}) "${author.username}" changed the Guild Prefix from ${this.prefix} to ${newPrefix}`);
        this.prefix = newPrefix;

        return this.save();
    };
};
