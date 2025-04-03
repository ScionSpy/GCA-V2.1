const { SUPPORT_SERVER } = require('../../../config');
const { GuildSettings } = require('../../Database/Classes');
const SupportServer = require('../Helpers/Extenders/SupportServer');


/**
 * @param {import('../Structures').BotClient} client
 */
module.exports = async (client) => {
    client.logger.webConsole(`Logged in as ${client.user.tag}! \`(${client.user.id})\`\n\nClient took ${Date.now() - client.startUpAt}ms to start!`);
    delete client.startUpAt;

    let supportGuild = client.guilds.cache.get(SUPPORT_SERVER);
    if (supportGuild) client.supportServer = new SupportServer(client, supportGuild);
    else {
        client.logger.warn(`{Config.SUPPORT_SERVER} is defined, however the Client is not in a guild with a guild.id queal to "${SUPPORT_SERVER}"!`);
        client.supportServer = false;
    };



    // Register Interactions
    /*if (client.config.INTERACTIONS.SLASH || client.config.INTERACTIONS.CONTEXT) {
        if (client.config.INTERACTIONS.GLOBAL) await client.registerInteractions();
        else await client.registerInteractions(client.config.INTERACTIONS.TEST_GUILD_ID);
    }*/
    await client.registerInteractions('1126377465741324429');


    if (client.guilds.cache.size == 0) return client.logger.warn(`Client is not in a Discord Guild! Invite: ${client.getInvite()}`);

    await loadGuildSettings(client);
};



/**
 * @param {import('../Structures').BotClient} client
 */
loadGuildSettings = async function(client){
    let dbSettings = await client.DB._Get("GuildSettings");

    // For all guilds the bot is currently in, pre-load their settings files.
    for (const [key, value] of client.guilds.cache) {
        let dbEntry;
        for (let x = 0; x < dbSettings.length; x++) {
            if (dbSettings[x].id !== key) continue;
            dbEntry = dbSettings[x];
            break;
        };

        let settings = new GuildSettings(value, dbEntry);
        // Resets {available} to true if false.
        // // Also creates a default settings file if one does not exist.
        if (!settings.available) {
            settings.available = true;
            await settings.save();
        };

        // Save this setting to our local cache.
        client.GuildSettings.set(key, settings);
    };


    // For all settings in the database,
    // // Cross-reference with the guilds the client is actively in.
    // // If a setting is marked as available, but the client is not in a matching guild, toggle the settings.available value to false;

    let guildIds = client.guilds.cache.map(guild => { return guild.id });
    for (let x = 0; x < dbSettings.length; x++) {
        // Client is not on this Guild, however the GuildSetting is still enabled.
        if (!guildIds.includes(dbSettings[x].id) && dbSettings[x].available) {
            try{
                await client.DB._Edit("GuildSettings", {id:dbSettings[x].id}, {"available":false});
                client.supportServer.leftGuild(dbSettings[x]);
            } catch (err) {
                client.logger.error(`client.ready().loadGuildSettings(); Error loading guilds\n`, err.stack);
            };
        };
    };
};





/**
 * @param {import('../Structures').BotClient} client
 */
/*loadGuildSettings = async function(client){
    let dbSettings = await client.DB._Get("GuildSettings");
    let results = {
        newGuilds: [ ], // {id: String, name: String}
        oldGuilds: [ ], // {id: String, name: String}
    };

    for (const [key, value] of bot.guilds.cache) {
        let found;
        for (let x = 0; x < dbSettings.length; x++) {

            if (dbSettings[x].id !== key) continue;
            found = dbSettings[x];
            break;
        };
        if (found) continue

        //bot._postNewGuild(bot.guilds.cache.get(key));

        //let guild = await new Guild(await bot.guilds.cache.get(key), bot);
        //guild = await guild.toggleClan(true);
        //guild.save();
    };
};*/
