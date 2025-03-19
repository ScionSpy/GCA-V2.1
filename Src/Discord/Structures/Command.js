/**
 * @typedef {Object} Validation
 * @property {function} callback - The condition to validate.
 * @property {String} message - The message to be displayed if callback condition is not met.
 */

/**
 * @typedef {Object} SubCommand
 * @property {String} name - subcommand title.
 * @property {String} description - subcommand description.
 */

/**
 * @typedef {"OWNER"|"ADMIN"|"INFO"} CommandCategory
 */

/**
 * @typedef {Object} InteractionInfo
 * @property {boolean} enabled - Whether the slash command is enabled or not.
 * @property {boolean} timeout - Whether the reply should timeout.
 * @property {import('discord.js').ApplicationCommandOptionData[]} options - command options
 */

/**
 * @typedef {Object} CommandInfo
 * @property {Boolean} enabled - Whether the 'prefix' version of this command is enabled or not.
 * @property {String[]} [aliases] - Alternative names for the command. (Must be lowercase)
 * @property {string} [usage=""] - The command usage format string.
 * @property {number} [minArgs=0] - Minimum number of arguments the command takes (default is 0)
 * @property {SubCommand[]} [subcommands=[]] - List of subcommands.
 */

/**
 * @typedef {Object} CommandData
 * @property {String} name - The name of the command. (must be lowercase)
 * @property {String} description - A short description of the command.
 * @property {Number} cooldown - The command cooldown in seconds.
 * @property {Boolean} isPremium - Does this command require VIP in order to be executed?
 * @property {CommandCategory} category - The category this command belongs to.
 * @property {import('discord.js').PermissionResolvable[]} [botPermissions] - Permissions required by the client to use the command.
 * @property {import('discord.js').PermissionResolvable[]} [userPermissions] - Permissions required by the user to use the command.
 * @property {Validation[]} [validations] - List of validations to be run before the command is executed.
 * @property {CommandInfo} prefCommand - The text based version of this command.
 * @property {InteractionInfo} slashCommand - The slash based version of this command.
 * @property {function(import('discord.js').Message, String[], Object)} exe - The callback to be executed when the command is executed.
 * @property {function(import('discord.js').ChatInputCommandInteraction, Object)} slashExe - The callback to be executed when the interaction is executed.
 */



/**
 * Placeholder for Command data.
 * @type {CommandData}
 */
module.exports = {
    name: "",
    description: "",
    cooldown: 0,
    isPremium: false,
    category: "NONE",
    botPermissions: [],
    userPermissions: [],
    validations: [],
    prefCommand: {
        enabled: true,
        aliases: [],
        usage: "",
        minArgs: 0,
        subcommands: [],
    },
    slashCommand: {
        enabled: true,
        ephemeral: false,
        options: [],
    },

    /**
     * Used to run a Prefix command.
     * @param {import('discord.js').Message} message
     * @param {String[]} args
     * @param {import('./GuildSettings.js')} settings
     */
    exe: async (message, args, settings) => { },

    /**
     * Used to run a Slash command.
     * @param {*} interaction
     * @param {import('./GuildSettings.js')} settings
     */
    slashExe: (interaction, settings) => { },
};
