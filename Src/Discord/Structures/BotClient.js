const {
    Client,
    Collection,
    GatewayIntentBits,
    Partials,
    WebhookClient,
    ApplicationCommandType,
} = require("discord.js");

const Logger = require('../../Structures/Logger/webLogger.js');
const path = require("path");
const { recursiveReadDirSync } = require("../Helpers/Utils.js");
const { validateCommand } = require("../Helpers/Validator.js");
const CommandCategory = require("./CommandCategory.js");
const { getTimeStamp } = require('../Helpers/Utils.js');


module.exports = class BotClient extends Client {
    /** @type {import('./Logger/webLogger.js')} */
    logger = new Logger('Discord Client');

    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildInvites,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildPresences,
                GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.GuildVoiceStates
            ],
            partials: [ Partials.User, Partials.Channel, Partials.Message, Partials.Reaction ],
            allowedMentions: {},
        });

        this.wait = require("util").promisify(setTimeout); // await client.wait(1000) - Wait 1 second.

        /**
         * @type {Array<import('./Command.js').CommandData>}
         */
        this.commands = []; // store actual command.
        this.commandIndex = new Collection(); // store (alias, arrayIndex) pair.

        /**
         * @type {Collection<string, import('./Command.js').CommandData>}
         */
        this.slashCommands = new Collection(); // store slash commands


        /**
         * @type {Array<import('../../Database/Schema/GuildSettings.js').GuildSettings>}
         */
        this.GuildSettings = new Collection();

        /**
         * @type {Array<import('../../Database/Classes/DbClan.js')>}
         */
        this.Clans = new Collection();

        /**
         * @type {Array<import('../../Database/Classes/DbPlayer.js')>}
         */
        this.Players = new Collection();



        /**
         * @type {false | import('../Helpers/Extenders/SupportServer.js')}
         */
        this.supportServer = false;//

        // Logger
        // this.logger = Logger;

        // Database
        this.DB = require('../../Database/API.js');
        this.API = {
            WoWs: require('../../WebAPI/Wargaming/index.js')
        };


    };

    /**
     *
     * @param {Number} startUpAt
     * @returns
     */
    async loadAndLogin(startUpAt){
        this.startUpAt = startUpAt;

        await this.loadCommands('./Src/Discord/Commands');
        await this.loadEvents('./Src/Discord/Events');
        await this.loadGcaEvents('./Src/Discord/Events_GCA');


        (async () => {
            //Start the client.
            await this.login(process.env.DISCORD_TOKEN);
        })();

        return this;
    };


    //#region Bootup / start up functions.

    /**
     * Load all events from the specified directory.
     * @param {string} directory directory containing the event files.
     */
    loadEvents(directory) {
        this.logger.log(`> Loading Discord events....`);
        let success = 0;
        let failed = 0;
        const clientEvents = [];

        recursiveReadDirSync(directory).forEach((filePath) => {
            const file = path.basename(filePath);
            try {
                const eventName = path.basename(file, ".js");
                const event = require(filePath);

                this.on(eventName, event.bind(null, this));
                //clientEvents.push(`✓ ${file}`);
                clientEvents.push(["✓", file]);

                delete require.cache[require.resolve(filePath)];
                success += 1;
            } catch (ex) {
                failed += 1;
                this.logger.error(`loadEvent - ${file}`, ex.stack);
            };
        });

        let events = prettyArrays(clientEvents, 2);
        this.logger.webConsole(`>> **Loaded ${success + failed} Discord** events. Success **(${success}) Failed (${failed})**`, events, {endNewLine:true, queueEmbed:true});
    };


    /**
     * Load all events from the specified directory.
     * @param {string} directory directory containing the event files.
     */
    loadGcaEvents(directory) {
        this.logger.log(`> Loading GCA Events....`);
        let success = 0;
        let failed = 0;
        const clientGcaEvents = [];

        recursiveReadDirSync(directory).forEach((filePath) => {
            const file = path.basename(filePath);
            try {
                const eventName = path.basename(file, ".js");
                const event = require(filePath);

                this.on(eventName, event.bind(null, this));
                //clientGcaEvents.push(`✓ ${file}`);
                clientGcaEvents.push(["✓", file]);

                delete require.cache[require.resolve(filePath)];
                success += 1;
            } catch (ex) {
                failed += 1;
                this.logger.error(`loadGcaEvent - ${file}`, ex.stack);
            };
        });

        let events = prettyArrays(clientGcaEvents, 2);
        if (events.length == 0) events = undefined;
        this.logger.webConsole(`>> **Loaded ${success + failed} GCA** events. **Success (${success}) Failed (${failed})**`, events, { endNewLine: true, queueEmbed: true });
    };


    /**
     * Find command matching the commandName
     * @param {string} commandName
     * @returns {import('./Command.js')|undefined}
     */
    getCommand(commandName) {
        const index = this.commandIndex.get(commandName.toLowerCase());
        return index !== undefined ? this.commands[index] : undefined;
    };


    /**
     * Register command file in the client
     * @param {import("@structures/Command")} cmd
     */
    loadCommand(cmd) {
        if (cmd.enabled) {

            // Prefix Command
            if (cmd.prefCommand?.enabled) {
                const index = this.commands.length;
                if (this.commandIndex.has(cmd.name)) {
                    throw new Error(`Command ${cmd.name} already registered`);
                }
                if (Array.isArray(cmd.prefCommand.aliases)) {
                    cmd.prefCommand.aliases.forEach((alias) => {
                        if (this.commandIndex.has(alias)) throw new Error(`Alias ${alias} already registered`);
                        this.commandIndex.set(alias.toLowerCase(), index);
                    });
                }
                this.commandIndex.set(cmd.name.toLowerCase(), index);
                this.commands.push(cmd);
            } else {
                this.logger.debug(`Skipping PrefixCommand '${cmd.name}'. Prefix Command Disabled!`);
            }

            // Slash Command
            if (cmd.slashCommand?.enabled) {
                if (this.slashCommands.has(cmd.name)) throw new Error(`Slash Command ${cmd.name} already registered`);
                this.slashCommands.set(cmd.name, cmd);
            } else {
                this.logger.debug(`Skipping Slash Command '${cmd.name}'. Slash Command Disabled!`);
            };

        } else {
            this.logger.debug(`Skipping Command '${cmd.name}'. Command Disabled!`);
        };
    };

    /**
     * Load all commands from the specified directory
     * @param {string} directory
     */
    async loadCommands(directory) {
        this.logger.webConsole(`Loading commands...`);
        const files = await recursiveReadDirSync(directory);
        for (const file of files) {
            try {
                const cmd = require(file);
                if (typeof cmd !== "object") continue;
                validateCommand(cmd);
                this.loadCommand(cmd);
            } catch (ex) {
                this.logger.error(`Failed to load ${file} Reason: ${ex.message}\n${ex.stack}`);
            }
        }


        if (this.slashCommands.size > 100) {
            this.logger.webError(`Attempted to load ${this.slashCommands.size} of 100 slash commands!`)
            throw new Error("A maximum of 100 slash commands can be enabled");
        };
        this.logger.webConsole(`**Loaded ${this.commands.length} commands.**`, null, { queueEmbed: true });
        //this.logger.webConsole(`Loaded ${this.slashCommands.size} slash commands`);
    };



    /**
     * Register slash command on startup
     * @param {string} [guildId]
     */
    async registerInteractions(guildId) {
        const toRegister = [];

        // filter slash commands
        //if (this.config.INTERACTIONS.SLASH) {
            this.slashCommands
                .map((cmd) => ({
                    name: cmd.name,
                    description: cmd.description,
                    type: ApplicationCommandType.ChatInput,
                    options: cmd.slashCommand.options,
                }))
                .forEach((s) => toRegister.push(s));
        //}

        // filter contexts
        /*if (this.config.INTERACTIONS.CONTEXT) {
            this.contextMenus
                .map((ctx) => ({
                    name: ctx.name,
                    type: ctx.type,
                }))
                .forEach((c) => toRegister.push(c));
        }*/

        // Register Globally
        if (!guildId) {
            await this.application.commands.set(toRegister);
        }

        // Register for a specific guild
        else if (guildId && typeof guildId === "string") {
            const guild = this.guilds.cache.get(guildId);
            if (!guild) {
                this.logger.error(`Failed to register interactions in guild ${guildId}`, new Error("No matching guild"));
                return;
            }
            await guild.commands.set(toRegister);
        }

        // Throw an error
        else {
            throw new Error("Did you provide a valid guildId to register interactions");
        }

        this.logger.debug(`Successfully registered ${toRegister.length} interactions!`);
    }

    //#endregion

    /**
     * @param {string} search
     * @param {Boolean} exact
     */
    async resolveUsers(search, exact = false) {
        if (!search || typeof search !== "string") return [];
        const users = [];

        // check if userId is passed
        const patternMatch = search.match(/(\d{17,20})/);
        if (patternMatch) {
            const id = patternMatch[1];
            const fetched = await this.users.fetch(id, { cache: true }).catch(() => { }); // check if mentions contains the ID
            if (fetched) {
                users.push(fetched);
                return users;
            }
        }

        // check if exact tag is matched in cache
        const matchingTags = this.users.cache.filter((user) => user.tag === search);
        if (exact && matchingTags.size === 1) users.push(matchingTags.first());
        else matchingTags.forEach((match) => users.push(match));

        // check matching username
        if (!exact) {
            this.users.cache
                .filter(
                    (x) =>
                        x.username === search ||
                        x.username.toLowerCase().includes(search.toLowerCase()) ||
                        x.tag.toLowerCase().includes(search.toLowerCase())
                )
                .forEach((user) => users.push(user));
        }

        return users;
    };


    getSettings(guild_id){
        if (!guild_id || isNaN(guild_id)) throw new Error(`Client.getSettings(guild_id); Must be a 'string' representing a Discord Guild ID; got ${typeof guild_id} : ${guild_id}`);

        let settings = this.GuildSettings.get(guild_id);
        if (!settings) {
            let dbResults = this.DB._Get("GuildSettings", {id:guild_id});
            if (!dbResults || dbResults.length == 0) return false;
            else settings = dbResults[0];
        };

        return settings;
    };


    /**
     * Get bot's invite
     */
    getInvite() {
        return this.generateInvite({
            scopes: ["bot", "applications.commands"],
            permissions: [
                "AddReactions",
                "AttachFiles",
                "BanMembers",
                "ChangeNickname",
                "Connect",
                "DeafenMembers",
                "EmbedLinks",
                "KickMembers",
                "ManageChannels",
                "ManageGuild",
                "ManageMessages",
                "ManageNicknames",
                "ManageRoles",
                "ModerateMembers",
                "MoveMembers",
                "MuteMembers",
                "PrioritySpeaker",
                "ReadMessageHistory",
                "SendMessages",
                "SendMessagesInThreads",
                "Speak",
                "ViewChannel",
            ],
        });
    };
};


/**
 * Custom 'prettyArrays' for event listings
 * @param {Array} array
 * @param {number} itemsPerLine MAX = 5
 * @returns {Array<{count:Number, place:Number}>}
 */
function prettyArrays(array, itemsPerLine) {
    let newArray = [];
    let POS = {
        count: 0,
        place: 0
    };

    for (let x = 0; x < array.length; x++) {
        let cmd = array[x];

        if (!newArray[POS.place]) newArray[POS.place] = [];
        newArray[POS.place].push(cmd);

        POS.count++;
        if (POS.count == itemsPerLine) {
            POS.count = 0;
            POS.place++;
        };
    };

    return newArray;
};
