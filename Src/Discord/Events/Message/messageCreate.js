const { commandHandler, automodHandler, statsHandler } = require("../../Handlers");
const { PREFIX, USE_PREFIX_COMMANDS } = require("../../../../config.js");
const GuildSettings = require('../../../Database/Classes/GuildSettings.js');

/**
 * @param {import('../../Structures').BotClient} client
 * @param {import('discord.js').Message} message
 */
module.exports = async (client, message) => {
    if (!message.guild || message.author.bot) return;

    let settings = await client.getSettings(message.guild.id);

    if (!settings){
        settings = new GuildSettings(message.guild);
        client.GuildSettings.set(message.guild.id, settings);
        //if (client.supportServer) await client.supportServer.joinedGuild(message.guild);
    };

    // command handler
    let isCommand = false;

    // check for bot mentions
    if (message.content.startsWith(`<@${client.user.id}>`)) {
        message.channel.sendSafely(`> My prefix is \`${settings.prefix}\``);
    };

    if (USE_PREFIX_COMMANDS && message.content && message.content.startsWith(settings.prefix)) {
        const commandName = message.content.replace(`${settings.prefix}`, "").split(/\s+/)[0];
        const cmd = client.getCommand(commandName);

        if(!cmd) console.log(client.commands, client.commandIndex)
        if (cmd) {
            isCommand = true;
            commandHandler.handlePrefixCommand(message, cmd, settings);
        };
    };

    // stats handler
    //if (settings.stats.enabled) await statsHandler.trackMessageStats(message, isCommand, settings);

    // if not a command
    //if (!isCommand) await automodHandler.performAutomod(message, settings);
};
