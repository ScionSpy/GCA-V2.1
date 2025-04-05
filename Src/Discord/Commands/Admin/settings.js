const { EmbedBuilder } = require('discord.js');
const { CommandData } = require('../../Structures/Command.js');

/**
 * @type {CommandData}
 */
const COMMAND = {
    name: "settings",
    description: "Manage this servers settings.",
    enabled: true,
    cooldown: 0,
    isPremium: true,
    category: "ADMIN",
    //botPermissions: ["ManageChannels", "ManageRoles", "ChangeNickname"],
    //userPermissions: ["ManageChannels", "ManageRoles", "ChangeNickname"],
    validations: [],
    prefCommand: {
        enabled: true,
        aliases: [],
        usage: "",
        minArgs: 0,
        subCommands: [
            { name: "prefix", description: "Sets this server's prefix", usage: `{P}settings prefix <newPrefix>` }
        ],
    },
    slashCommand: {
        enabled: false,
        ephemeral: false,
        options: [],
    },

    /**
     * Used to run a Prefix command.
     * @param {import('discord.js').Message} message
     * @param {String[]} args
     * @param {import('../../../Database/Classes/GuildSettings.js')} settings
     */
    exe: async (message, args, settings) => {
        if (!args || args.length == 0) {
            return message.reply({embeds:[await getSettingsDisplay(message.guild, settings)]});
        };


        let subCmd = args.shift().toLowerCase();
        let msg;

        switch(subCmd){
            case ("help"): msg = await getSettingsHelp(message, args, settings); break;
            case("prefix"): msg = await updatePrefix(message, args, settings); break;

            default:
                let subCmds = COMMAND.prefCommand.subCommands.map(cmd => { return cmd.name });
                res = `\`${subCmd}\` is not a valid settings sub command.\n• Try one of the following instead: \`${subCmds}\``;
                message.channel.send(res);
        };

        return message.channel.sendSafely(msg, {split:true});
    },


    // @ TODO
    /**
     * Used to run a Slash command.
     * @param {*} interaction
     * @param {import('../../../Database/Classes/GuildSettings.js')} settings
     */
    slashExe: (interaction, settings) => { },
};
module.exports = COMMAND;

/**
 * @param {import('discord.js').Guild} guild
 * @param {import('../../../Database/Classes/index.js').GuildSettings} settings
 */
getSettingsDisplay = async function(guild, settings){
    let embed = new EmbedBuilder();
        embed.setTitle("Server Settings")
        embed.setAuthor({name:guild.name, iconURL: guild.iconURL()});
        embed.setFooter({text:`${guild.client.user.username} | [ ${settings.prefix}settings help ] for Sub Commands.`, iconURL: guild.client.user.avatarURL()});
        embed.addFields(
            {name:"General", value:`\`\`\`js\nPrefix : ${settings.prefix}\`\`\``}
        )
    ;
    return embed;
};

/**
 * @param {import('discord.js').message} message
 * @param {String[]} args
 * @param {import('../../../Database/Classes/index.js').GuildSettings} settings
 */
getSettingsHelp = async function(message, args, settings){
    if (!args || args.length == 0) return `Available Settings: \`${COMMAND.prefCommand.subCommands.map(cmd => { return cmd.name }).join(`\`, \``)}\``;

    let subs = {};
    for (let x = 0; x < COMMAND.prefCommand.subCommands.length; x++){
        let sub = COMMAND.prefCommand.subCommands[x];
        subs[sub.name] = sub.usage;
    };

    return subs[args[0]].replace('{P}', settings.prefix);
};

/**
 * @param {import('discord.js').message} message
 * @param {String[]} args
 * @param {import('../../../Database/Classes/index.js').GuildSettings} settings
 */
updatePrefix = async function(message, args, settings){
    if (!args || args.length == 0) {
        let usage = await getSettingsHelp(message, ['prefix'], settings);
        return `This command requires arguments to execute!\n\`${usage}\``;
    };

    let newPrefix = args.shift().toLowerCase();

    if (newPrefix === settings.prefix) return `The Guild prefix is already [ \`${newPrefix}\` ]`;

    let res = await settings.setPrefix(newPrefix, message.author);
    let msg;

    if (res) msg = `Changed prefix to [ \`${newPrefix}\` ]`;
    else msg = `Error updating prefix!!\`\`\`xl\n${res.stack}\`\`\``;

    return msg;
};
