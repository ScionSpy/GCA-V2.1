const { DbClanMember, DbPlayer } = require('../../../Database/Classes/index.js');
const { ClanMemberSchema } = require('../../../Database/Schemas/index.js');
const BotClient = require('../../Structures/BotClient.js');
const { CommandData } = require('../../Structures/Command.js');
const {
    EmbedBuilder,
    CommandInteraction,
    ApplicationCommandOptionType
} = require('discord.js');


/**
 * Placeholder for Command data.
 * @type {CommandData}
 */
module.exports = {
    name: "verify",
    description: "Binds a Discord account to their World of Warships counter-part.",
    enabled: true,
    cooldown: 0,
    isPremium: false,
    category: "PLAYER",
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
                name: "player-name",
                description: "Your World of Warships Player Name.",
                type: ApplicationCommandOptionType.String,
                required: true
            },
            {
                name: "login",
                description: "Allow the Client to automatically update your Clan Tag and Rank as it changes?",
                type: ApplicationCommandOptionType.String,
                choices: [
                    { name: "Yes", value: "true" },
                    { name: "No", value: "false" },
                ],
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
    exe: async (message, args, settings) => { },

    /**
     * Used to run a Slash command.
     * @param {import('discord.js').CommandInteraction} interaction
     * @param {import('../../../Database/Classes/GuildSettings.js')} settings
     */
    slashExe: async (interaction, settings) => {
        /** @type {import('discord.js').User} */
        let user = interaction.user;

        let name = await interaction.options.getString("player-name");
        let login = await interaction.options.getString("login");

        /** @type {PlayerSchema} */
        let player = await findPlayer(interaction.client, name);

        //// player == {DbPlayer | DbClanMember}

        // @ToDo if 'login', create webserver.
        // // Send "User Only" followup with a "Login here" link per Wargaming API.

        // @ToDo Verify user logged in is the same name as one verified.
        // // Verify intention if differing names.
        // // @ToDo if NOT 'login' Verify 'player-name' is not already registered.
        // // // Throw error. Request Apeal.

        // @ToDo Update player name on THIS server.
        // // Cross-ref servers for this member, update on those servers as well.

        // @ToDo Where applicable, grant roles based on clan and server settings

        // @ToDo announce player verified.
        return await interaction.followUp(`\`\`\`js\n${JSON.stringify(player, null, 4)}\`\`\``);
    },
};


/**
 *
 * @param {BotClient} client
 * @param {String} name
 * @returns {LookupData}
 */
async function findPlayer(client, name){
    let playerLookUp = await client.API.WoWs.Players.lookup(name, true);

    if (!playerLookUp[0]) return false;
    let ID = playerLookUp[0].account_id;

    let player = await client.API.WoWs.Players.getDetails(ID);
    player = player[0][ID];

    let hasClan = await client.API.WoWs.Players.getClanInfo(ID);
    let Player;

    if (hasClan && hasClan[0][ID]){
        player.clan = hasClan[0][ID];
        Player = new DbClanMember(player);
    } else {
        Player = new DbPlayer(player);
    };

    return Player;
};
