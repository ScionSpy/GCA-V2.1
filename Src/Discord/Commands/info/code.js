const {
    ChannelType,
    ButtonBuilder,
    ActionRowBuilder,
    ComponentType,
    TextInputStyle,
    TextInputBuilder,
    ModalBuilder,
    ButtonStyle,
    ApplicationCommand,
    ApplicationCommandOptionType,
} = require("discord.js");

/**
 * Placeholder for Command data.
 * @type {import('../../Structures/Command.js').CommandData}
 */
module.exports = {
    name: "code",
    description: "Displays a reward code and it's rewards!",
    enabled: true,
    cooldown: 0,
    isPremium: false,
    category: "INFO",
    botPermissions: [],
    userPermissions: [],
    validations: [],
    prefCommand: {
        enabled: false,
        aliases: [],
        usage: "",
        minArgs: 0,
        subcommands: [],
    },
    slashCommand: {
        enabled: true,
        ephemeral: false,
        options: [
            {
                name: "reward-code",
                description: "Reward Code",
                type: ApplicationCommandOptionType.String,
                required: true,
            },
            {
                name: "reward",
                description: "Reward",
                type: ApplicationCommandOptionType.String,
                required: true,
            }
        ],
    },

    /**
     * Used to run a Prefix command.
     * @param {import('discord.js').Message} message
     * @param {String[]} args
     * @param {import('../../Database/Classes/GuildSettings.js')} settings
     */
    //exe: async (message, args, settings) => { },

    /**
     * Used to run a Slash command.
     * @param {ApplicationCommand} interaction
     * @param {import('../../Database/Classes/GuildSettings.js')} settings
     */
    slashExe: async (interaction, settings) => {
        let rewardCode = interaction.options.getString("reward-code");
        let reward = interaction.options.getString("reward");

        let response;
        let codePost;

        rewardCode = rewardCode.toUpperCase();
        if (await interaction.client.DB.Client.checkForRewardCode(rewardCode)) return interaction.followUp(`This RewardCode was already submitted by another player.`);

        let code = `https://na.wargaming.net/shop/redeem/?bonus_mode=${rewardCode}`;
        let user = interaction.user;
        codePost = `${user ? 'Submitted by: ' + user.displayName ? user.displayName + '\n' : user.id ? 'Submitted by: ' + user.id + '\n' : '' : ''}[${rewardCode}](${code}) = ${reward}`;

        // @TODO: Submit code to all servers.
        // // Check the { interaction.client.GuildSettings } for 'giveaway' options, and submit to provided TextChannel.

        // @TEMPORARY
        let messageLink = `https://ptb.discord.com/channels/{GUILD_ID}/{CHANNEL_ID}/{MESSAGE_ID}`;
        let ch_id = '1137246476188274750';
        try{
            let ch = await interaction.client.channels.cache.get(ch_id);
            await ch.send(codePost).then( (msg) => {
                messageLink = messageLink
                    .replace('{GUILD_ID}', ch.guild.id)
                    .replace('{CHANNEL_ID}', ch.id)
                    .replace('{MESSAGE_ID}', msg.id)
            });
        } catch (err) {
            interaction.client.logger.error(`Unable to send 'code' link to channel ${ch_id}`, err);
        };

        response = `Reward posted!\n> ${messageLink}`;

        await interaction.followUp(response);

        let rewardData = {
            rewardCode,
            reward,
            submittedBy: user.id,
            timestamp: Date.now()
        };
        
        await interaction.client.DB.Client.submitRewardCode(rewardData);
    },
};
