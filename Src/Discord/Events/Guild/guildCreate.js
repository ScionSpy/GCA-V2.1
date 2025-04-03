const { GuildSettings } = require('../../../Database/Classes/index.js');


/**
 *
 * @param {import('discord.js').Guild} guild
 */
module.exports = async function (guild){

    let settings = new GuildSettings(guild);
    guild.client.GuildSettings.set(guild.id, settings);

    if (guild.client.supportServer) guild.client.supportServer.joinedGuild(guild);
};
