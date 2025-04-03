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
    EmbedBuilder
} = require("discord.js");
const config = require("../../../../config.js");
const { Embed } = require("discord.js");

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
            },
            {
                name: "author",
                description: "The author whom announced this code.",
                type: ApplicationCommandOptionType.String,
                required: false,
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
        let author = interaction.options.getString("author");
        if (author && config.OWNERS.includes(interaction.user.id)){
            if (isNaN(author)) return interaction.followUp(`\`author\` must be a user ID.`);
        } else {
            author = undefined;
        };

        let response;
        let codePost;
        let user;

        rewardCode = rewardCode.toUpperCase();
        if (await interaction.client.DB.Client.checkForRewardCode(rewardCode)) {
            // @TODO: Allow automatic release if {X} users have submitted this code.
            // // Automatic release will submit the code, Redeem Code: {CODE}\n• "Unverified Rewards"
            // // // Once verified, the listing will be updated to an official Giveaways post.
            return interaction.followUp(`This RewardCode was already submitted by another player.`);
        };

        reward = reward.split('//');

        if (!author) {
            user = interaction.user;
        } else {
            user = interaction.guild.members.cache.get(author);
        };

        let Data = {
            code: rewardCode,
            reward: reward,
            user: user
        };
        let rewardEmbed = await createGiveawayEmbed(Data);

        // @TODO: Submit code to all servers.
        // // Check the { interaction.client.GuildSettings } for 'giveaway' options, and submit to provided TextChannel.

        // @TEMPORARY
        let messageLink = `https://ptb.discord.com/channels/{GUILD_ID}/{CHANNEL_ID}/{MESSAGE_ID}`;
        let ch_id = '1354207937807253706';
        try{
            let ch = await interaction.client.channels.cache.get(ch_id);
            await ch.send({embeds: [rewardEmbed]}).then( (msg) => {
                messageLink = messageLink
                    .replace('{GUILD_ID}', ch.guild.id)
                    .replace('{CHANNEL_ID}', ch.id)
                    .replace('{MESSAGE_ID}', msg.id)
            });
        } catch (err) {
            interaction.client.logger.error(`Command.Code.slash(); Unable to send 'code' to channel ${ch_id}`, err);
        };

        response = `Submitted Reward Code for review on the G-C-A server!\n> ${messageLink}`;

        await interaction.followUp({embeds:[rewardEmbed]});

        let rewardData = {
            rewardCode,
            reward,
            submittedBy: user.id,
            timestamp: Date.now()
        };

        await interaction.client.DB.Client.submitRewardCode(rewardData);
    },
};


/**
 * Creates a Code Giveaway Embed.
 * @param {Object} data
 * @param {String} data.code
 * @param {String} data.reward
 * @param {import('discord.js').GuildMember} data.user
 */
createGiveawayEmbed = async function createGiveawayEmbed(data){

    let codeLink = `Redeem Code: __[${ data.code }](https://na.wargaming.net/shop/redeem/?bonus_mode=${data.code})__`;
    let embed = new EmbedBuilder();
    embed.setAuthor({name: data.user.displayName, iconURL: data.user.displayAvatarURL()});
    embed.addFields(
        { name: `Reward Code`, value: `${codeLink}\n• :anchor: ${data.reward.join('\n• :anchor: ').trim()}`}
    );
    embed.setColor("Random");
    embed.setTimestamp();
    embed.setFooter({text: `G-C-A's Automaton`});

    return embed;
};
