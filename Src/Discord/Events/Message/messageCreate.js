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
    if (settings && settings.constructor.name !== "GuildSettings"){
        settings = new GuildSettings(message.guild, settings);
    }
    else if (!settings){
        settings = new GuildSettings(message.guild);
        client.GuildSettings.set(message.guild.id, settings);
        //if (client.supportServer) await client.supportServer.joinedGuild(message.guild);
    };

    // command handler
    let isCommand = false;

    // check for bot mentions
    if (message.content.startsWith(`<@${client.user.id}>`)) {
        message.channel.sendSafely(`> My global prefix is \`${PREFIX}\`\n My ${message.guild.mame} prefix is \`${settings.prefix}\``);
    };

    if (USE_PREFIX_COMMANDS && message.content &&
        // Does this message start with the Global {PREFIX} or the guild {settings.prefix} ?
        (message.content.startsWith(settings.prefix) || message.content.startsWith(PREFIX))
    ) {
        let content;
        // Remove the prefix from the start of the mesage.
        if (message.content.startsWith(settings.prefix)) content = message.content.replace(settings.prefix, "");
        else if (message.content.startsWith(PREFIX)) content = message.content.replace(PREFIX, "");

        const commandName = content.split(/\s+/)[0];
        const cmd = client.getCommand(commandName);

        //if(!cmd) console.log(client.commands, client.commandIndex)
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
