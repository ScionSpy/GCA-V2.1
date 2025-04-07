const {
    EmbedBuilder,
    CommandInteraction,
    ApplicationCommandOptionType
} = require('discord.js');
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
    userPermissions: ["ManageChannels", "ManageRoles", "ChangeNickname"],
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
        enabled: true,
        ephemeral: false,
        options: [
            {
                name: "view",
                description: "Displays this guild's settings.",
                type: ApplicationCommandOptionType.Subcommand,
            },

            {
                name: "set-prefix",
                description: "Sets this guilds's prefix.",
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "new-prefix",
                        description: "Prefix to assign this server.",
                        type: ApplicationCommandOptionType.String,
                        required: true
                    }
                ]
            },

            {
                name: "set-channel",
                description: "Sets a designated output channel.",
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name:"channel-type",
                        description: "The channel type to set.",
                        type: ApplicationCommandOptionType.String,
                        required: true,
                        choices: [
                            { name: "WoWs Codes", value: "giveaways" },
                            { name: "Member Updates", value: "member_updates"}
                        ]
                    },
                    {
                        name: "channel",
                        description: "The channel referenced.",
                        type: ApplicationCommandOptionType.Channel,
                        required: true
                    }
                ],
            }


        ],
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
            case ("help"): msg = await getSettingsHelp(args, settings); break;
            case("prefix"): msg = await updatePrefix(args, message.author, settings); break;

            default:
                let subCmds = COMMAND.prefCommand.subCommands.map(cmd => { return cmd.name });
                res = `\`${subCmd}\` is not a valid settings sub command.\n• Try one of the following instead: \`${subCmds}\``;
                message.channel.send(res);
        };

        return message.channel.sendSafely(msg, {split:true});
    },


    /**
     * Used to run a Slash command.
     * @param {CommandInteraction} interaction
     * @param {import('../../../Database/Classes/GuildSettings.js')} settings
     */
    slashExe: async (interaction, settings) => {
        /** @type {import('discord.js').User} */
        let user = interaction.user;

        let msg;

        switch (interaction.options.getSubcommand()){
            case("view"):
                msg = await getSettingsDisplay(interaction.guild, settings);
                return interaction.followUp({embeds:[msg]});
            break;
            case("set-prefix"):
                let newPrefix = interaction.options.getString('new-prefix');

                msg = await updatePrefix([newPrefix], user, settings);
            break;

            case("set-channel"):
                let channelType = interaction.options.getString("channel-type");
                let channel = interaction.options.getChannel("channel");

                msg = await updateChannel({ channelType , channel }, user, settings);
            break;
        };

        interaction.followUp(msg);
    },
};
module.exports = COMMAND;


/**
 * @param {import('discord.js').Guild} guild
 * @param {import('../../../Database/Classes/index.js').GuildSettings} settings
 */
getSettingsDisplay = async function(guild, settings){

    getChannelName = async function(channel_id){
        if (!channel_id) return 'unasigned';
        let ch = await guild.channels.cache.get(channel_id);
        return ch.name;
    };

    let embed = new EmbedBuilder();
        embed.setTitle("Server Settings")
        embed.setAuthor({name:guild.name, iconURL: guild.iconURL()});
        embed.setFooter({text:`${guild.client.user.username} | [ ${settings.prefix}settings help ] for Sub Commands.`, iconURL: guild.client.user.avatarURL()});
        embed.addFields(
            {name:"General", value:`\`\`\`js\nPrefix : ${settings.prefix}\`\`\``},
            {name:"Channels", value:`\`\`\`js\n Codes Giveaway : ${await getChannelName(settings.channels["giveaways"])}\n Member Updates : ${await getChannelName(settings.channels["member_updates"])}\`\`\``}
        )
    ;
    return embed;
};


/**
 * @param {String[]} args
 * @param {import('../../../Database/Classes/index.js').GuildSettings} settings
 */
getSettingsHelp = async function(args, settings){
    if (!args || args.length == 0) return `Available Settings: \`${COMMAND.prefCommand.subCommands.map(cmd => { return cmd.name }).join(`\`, \``)}\``;

    let subs = {};
    for (let x = 0; x < COMMAND.prefCommand.subCommands.length; x++){
        let sub = COMMAND.prefCommand.subCommands[x];
        subs[sub.name] = sub.usage;
    };

    return subs[args[0]].replace('{P}', settings.prefix);
};



/**
 * @param {String[]} args
 * @param {import('discord.js').User} author
 * @param {import('../../../Database/Classes/index.js').GuildSettings} settings
 */
async function updatePrefix(args, author, settings){
    if (!args || args.length == 0) {
        let usage = await getSettingsHelp(['prefix'], settings);
        return `This command requires arguments to execute!\n\`${usage}\``;
    };

    let newPrefix = args.shift().toLowerCase();

    if (newPrefix === settings.prefix) return `The Guild prefix is already [ \`${newPrefix}\` ]`;

    let res = await settings.setPrefix(newPrefix, author);
    let msg;

    if (res) msg = `Changed prefix to [ \`${newPrefix}\` ]`;
    else msg = `Error updating prefix!!\`\`\`xl\n${res.stack}\`\`\``;

    return msg;
};


/**
 * @todo Add Prefix command functionaility.
 *
 * @param {Object} data
 * @param {import('../../../Database/Classes/GuildSettings.js').ChannelTypes} data.channelType - Channel type that we're settings
 * @param {import('discord.js').GuildChannel} data.channel - Channel were updataing to.
 * @param {import('discord.js').User} author
 * @param {import('../../../Database/Classes/index.js').GuildSettings} settings
 */
async function updateChannel(data, author, settings){
    // @ ToDo
    // prefix command checks

    if ( data.channel.id === settings.channels[data.channelType]) return `That channel is already set to [ ${data.channel} ]`;

    let res = await settings.setChannel(data.channelType, data.channel, author);
    let msg;

    if (res) msg = `Changed '${data.channelType}' channel to [ ${data.channel} ]`;
    else msg = `Error updating '${data.channelType}' channel!!\`\`\`xl\n${res.stack}\`\`\``;

    return msg;
};
