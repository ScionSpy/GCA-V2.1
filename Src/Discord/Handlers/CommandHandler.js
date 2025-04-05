const { EmbedBuilder, ApplicationCommandOptionType, codeBlock } = require("discord.js");
const { OWNERS, WHITELISTED, PREFIX } = require("../../../config");
const { parsePermissions } = require("../Helpers/Utils");
const { timeformat } = require("../Helpers/Utils");
const GuildSettings = require("../../Database/Classes/GuildSettings");
//const { getSettings } = require("@schemas/Guild");

const cooldownCache = new Map();


module.exports = {
    //#region Prefix Command

    /**
     * @param {import('discord.js').Message} message
     * @param {import("../Structures/Command")} cmd
     * @param {GuildSettings} settings
     */
    handlePrefixCommand: async function (message, cmd, settings) {
        if (!message.channel.permissionsFor(message.guild.members.me).has("SendMessages")) return;

        const prefix = settings.prefix;
        const args = message.content.replace(prefix, "").split(/\s+/);
        const commandName = args.shift().toLowerCase();


        // callback validations
        if (cmd.validations) {
            for (const validation of cmd.validations) {
                if (!validation.callback(message)) {
                    return message.replySafely(validation.message);
                };
            };
        };

        // Owner commands
        if (cmd.category === "OWNER" && !OWNERS.includes(message.author.id)) {
            return message.replySafely("This command is only accessible to the bot owners.");
        };

        // VIP commands.
        if (cmd.isPremium && !OWNERS.includes(message.author.id) && !WHITELISTED.includes(message.author.id)) {
            return message.replySafely(`This command is restricted to Donators.`);
        };

        // check user permissions
        if (cmd.userPermissions && cmd.userPermissions?.length > 0) {
            if (!message.channel.permissionsFor(message.member).has(cmd.userPermissions)) {
                return message.replySafely(`You need ${parsePermissions(cmd.userPermissions)} for this command.`);
            };
        };

        // check bot permissions
        if (cmd.botPermissions && cmd.botPermissions.length > 0) {
            if (!message.channel.permissionsFor(message.guild.members.me).has(cmd.botPermissions)) {
                return message.replySafely(`I need ${parsePermissions(cmd.botPermissions)} for this command.`);
            };
        };

        // minArgs count
        if (cmd.prefCommand?.minArgs > args.length) {
            const usageEmbed = this.getCommandUsage(cmd, prefix, commandName);
            return message.replySafely({ embeds: [usageEmbed] });
        };

        // cooldown check
        if (cmd.cooldown > 0) {
            const remaining = getRemainingCooldown(message.author.id, cmd);
            if (remaining > 0) {
                return message.replySafely(`This command is on cooldown. You can again use the command in \`${timeformat(remaining)}\`.`);
            };
        };

        try {
            await cmd.exe(message, args, settings);
        } catch (ex) {
            message.client.logger.error(`Command Error: '${cmd.name}'`, ex.stack);
            message.replySafely("An error occurred while attempting to run this command.").then( /** @param {import('discord.js').Message} msg */(msg) => {
                msg.reply(`\`\`\`xl\n${ex.stack}\`\`\``);
            });

            message.client.supportServer.postError(`Command Error: '${cmd.name}'`, ex.stack);
        } finally {
            if (cmd.cooldown > 0) applyCooldown(message.author.id, cmd);
        };
    },

    /**
     * Build a usage embed for this command
     * @param {import('@structures/Command')} cmd - command object
     * @param {string} prefix - guild bot prefix
     * @param {string} invoke - alias that was used to trigger this command
     * @param {string} [title] - the embed title
     */
    getCommandUsage(cmd, prefix = PREFIX, commandName, title = "Usage") {
        let desc = "";
        if (cmd.prefCommand.subcommands && cmd.prefCommand.subcommands.length > 0) {
            cmd.prefCommand.subcommands.forEach((sub) => {
                desc += `\`${prefix}${commandName || cmd.name} ${sub.trigger}\`\n❯ ${sub.description}\n\n`;
            });
            if (cmd.cooldown) {
                desc += `**Cooldown:** ${timeformat(cmd.cooldown)}`;
            };
        } else {
            desc += `\`\`\`css\n${prefix}${commandName || cmd.name} ${cmd.prefCommand.usage}\`\`\``;
            if (cmd.description !== "") desc += `\n**Description:** ${cmd.description}`;
            if (cmd.cooldown) desc += `\n**Cooldown:** ${timeformat(cmd.cooldown)}`;
        };

        const embed = new EmbedBuilder().setColor(EMBED_COLORS.DEFAULT).setDescription(desc);
        if (title) embed.setAuthor({ name: title });
        return embed;
    },

    //#endregion

    //#region Slash Command. (Interaction)

    /**
     * @param {import('discord.js').ChatInputCommandInteraction} interaction
     */
    handleSlashCommand: async function (interaction) {
        /** @type {import('../Structures/Command')} */
        const cmd = interaction.client.slashCommands.get(interaction.commandName);
        if (!cmd) return interaction.reply({ content: "An error has occurred", ephemeral: true }).catch(() => { });

        // callback validations
        if (cmd.validations) {
            for (const validation of cmd.validations) {
                if (!validation.callback(interaction)) {
                    return interaction.reply({
                        content: validation.message,
                        ephemeral: true,
                    });
                }
            }
        };

        // Owner commands
        if (cmd.category === "OWNER" && !OWNERS.includes(interaction.user.id)) {
            return interaction.reply({
                content: `This command is only accessible to bot owners`,
                ephemeral: true,
            });
        };

        // VIP commands.
        if (cmd.isPremium && !OWNERS.includes(interaction.user.id) && !WHITELISTED.includes(interaction.user.id)) {
            return interaction.reply({
                content: `This command is restricted to Donators.`,
                ephemeral: true,
            });
        };

        // user permissions
        if (interaction.member && cmd.userPermissions?.length > 0) {
            if (!interaction.member.permissions.has(cmd.userPermissions)) {
                return interaction.reply({
                    content: `You need ${parsePermissions(cmd.userPermissions)} for this command`,
                    ephemeral: true,
                });
            }
        }

        // bot permissions
        if (cmd.botPermissions && cmd.botPermissions.length > 0) {
            if (!interaction.guild.members.me.permissions.has(cmd.botPermissions)) {
                return interaction.reply({
                    content: `I need ${parsePermissions(cmd.botPermissions)} for this command`,
                    ephemeral: true,
                });
            }
        }

        // cooldown check
        if (cmd.cooldown > 0) {
            const remaining = getRemainingCooldown(interaction.user.id, cmd);
            if (remaining > 0) {
                return interaction.reply({
                    content: `You are on cooldown. You can again use the command in \`${timeformat(remaining)}\``,
                    ephemeral: true,
                });
            }
        }

        try {
            await interaction.deferReply({ ephemeral: cmd.slashCommand.ephemeral });
            const settings = await interaction.client.getSettings(interaction.guild.id);
            await cmd.slashExe(interaction, settings );
        } catch (ex) {
            await interaction.followUp(`An error occurred while attempting to run this command!\n\`\`\`xl\n${ex.stack}\`\`\``);
            interaction.client.logger.error(`Command Error: '${cmd.name}'`, ex.stack);
            interaction.client.supportServer.postError(`Command Error: '${cmd.name}'`, ex.stack);

        } finally {
            if (cmd.cooldown > 0) applyCooldown(interaction.user.id, cmd);
        }
    },

    /**
     * @param {import('@structures/Command')} cmd - command object
     */
    getSlashUsage(cmd) {
        let desc = "";
        if (cmd.slashCommand.options?.find((o) => o.type === ApplicationCommandOptionType.Subcommand)) {
            const subCmds = cmd.slashCommand.options.filter((opt) => opt.type === ApplicationCommandOptionType.Subcommand);
            subCmds.forEach((sub) => {
                desc += `\`/${cmd.name} ${sub.name}\`\n❯ ${sub.description}\n\n`;
            });
        } else {
            desc += `\`/${cmd.name}\`\n\n**Help:** ${cmd.description}`;
        }

        if (cmd.cooldown) {
            desc += `\n**Cooldown:** ${timeformat(cmd.cooldown)}`;
        }

        return new EmbedBuilder().setColor(EMBED_COLORS.BOT_EMBED).setDescription(desc);
    },

    //#endregion
};


/**
 * @param {string} memberId
 * @param {object} cmd
 */
function applyCooldown(memberId, cmd) {
    const key = cmd.name + "|" + memberId;
    cooldownCache.set(key, Date.now());
}

/**
 * @param {string} memberId
 * @param {object} cmd
 */
function getRemainingCooldown(memberId, cmd) {
    const key = cmd.name + "|" + memberId;
    if (cooldownCache.has(key)) {
        const remaining = (Date.now() - cooldownCache.get(key)) * 0.001;
        if (remaining > cmd.cooldown) {
            cooldownCache.delete(key);
            return 0;
        }
        return cmd.cooldown - remaining;
    }
    return 0;
}
