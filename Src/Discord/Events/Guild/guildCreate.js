const { GuildSettings } = require('../../../Database/Classes/index.js');
const SupportServer = require('../../Helpers/Extenders/SupportServer');
const { SUPPORT_SERVER } = require('../../../../config.js');


/**
 * @param {import('../../Structures/BotClient.js')} client
 * @param {import('discord.js').Guild} guild
 */
module.exports = async function (client, guild){
    let presetSettings = await client.getSettings(guild.id);
    let settings = new GuildSettings(guild, presetSettings);
    await client.wait(1000);

    if (!settings.available) {
        settings.available = true;
        settings.save();
    };

    client.GuildSettings.set(guild.id, settings);
console.log("createGuild")
    if (client.supportServer) client.supportServer.joinedGuild(guild);
    else if (SUPPORT_SERVER && guild.id === SUPPORT_SERVER) {
        client.supportServer = new SupportServer(client, guild);
        client.logger.log(`Client joined Support Server!!\n       { id: ${guild.id}, name: ${guild.name} }`);
    };
};
