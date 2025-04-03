const { GuildSettings } = require('../../../Database/Classes/index.js');
const { SUPPORT_SERVER } = require('../../../../config.js');


/**
 *
 * @param {import('discord.js').Guild} guild
 */
module.exports = async function (client, guild) {

    let settings = client.getSettings(guild.id);
    if (!settings) settings = new GuildSettings(guild, settings);

    settings.available = false;
    settings.save();

    if (guild.client.supportServer) {
        if (guild.id === SUPPORT_SERVER) {
            client.supportServer = false;
            client.logger.warn(`Client left Support Server!!\n> { id: ${guild.id}, name: ${guild.name} }`);
        } else client.supportServer.leftGuild(guild);
        client.GuildSettings.delete(guild.id);
    };
};
