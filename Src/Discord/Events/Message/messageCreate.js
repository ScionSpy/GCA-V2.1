const { commandHandler, automodHandler, statsHandler } = require("../../Handlers");
const { PREFIX } = require("../../../../config.js");
//const { getSettings } = require("@schemas/Guild");

/**
 * @param {import('../../Structures').BotClient} client
 * @param {import('discord.js').Message} message
 */
module.exports = async (client, message) => {
    if (!message.guild || message.author.bot) return;
    //const settings = await getSettings(message.guild);
    const settings = { prefix: PREFIX ? PREFIX : "!" }; //Dummy Settings

    // command handler
    let isCommand = false;

    // check for bot mentions
    if (message.content.startsWith(`<@${client.user.id}>`)) {
        message.channel.sendSafely(`> My prefix is \`${settings.prefix}\``);
    };

    if (message.content && message.content.startsWith(settings.prefix)) {
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
