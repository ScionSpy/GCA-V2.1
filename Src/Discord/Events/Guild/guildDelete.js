const { GuildSettings } = require('../../../Database/Classes/index.js');


/**
 *
 * @param {import('discord.js').Guild} guild
 */
module.exports = async function (guild) {

    let settings = guild.client.GuildSettings.get(guild.id);
    if (!settings) settings = new GuildSettings(guild);

    settings.available = false;
    settings.save();

    if (guild.client.supportServer) guild.client.supportServer.leftGuild(guild);
};
