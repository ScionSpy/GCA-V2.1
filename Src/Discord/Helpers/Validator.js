const CommandCategory = require("../Structures/CommandCategory");
const permissions = require("./Permissions");
const config = require("../../../config");
const LOGGER = require('../../Structures/Logger/logger');
const Logger = new LOGGER('Validator');
const { ApplicationCommandType } = require("discord.js");

module.exports = class Validator {
    static validateConfiguration() {

        // Bot Token
        if (!process.env.BOT_TOKEN) {
            Logger.error("env: BOT_TOKEN cannot be empty");
            process.exit(1);
        };

        // Validate Database Config
        if (!process.env.DATABASE_URI) {
            Logger.error("env: DATABASE_URI cannot be empty");
            process.exit(1);
        };


        // Pass Warnings.
        if (config.OWNERS.length === 0) Logger.warn("config.js: OWNERS is empty.");
        if (!config.SUPPORT_SERVER) Logger.warn("config.js: SUPPORT_SERVER is not provided.");
        if (!config.PREFIX) Logger.warn("config.js: PREFIX is blank.");
        if (
            config.LOGGER.writeToWebhook &&
            (
                config.LOGGER.WEBHOOKS.logger_console ||
                config.LOGGER.WEBHOOKS.logger_debug ||
                config.LOGGER.WEBHOOKS.logger_warning ||
                config.LOGGER.WEBHOOKS.logger_error
            )
        ){
            let disabledWebHooks = [];

            if (config.LOGGER.WEBHOOKS.logger_console) disabledWebHooks.push("LOGGER_WEBHOOK_CONSOLE");
            if (config.LOGGER.WEBHOOKS.logger_debug) disabledWebHooks.push("LOGGER_WEBHOOK_DEBUG");
            if (config.LOGGER.WEBHOOKS.logger_warning) disabledWebHooks.push("LOGGER_WEBHOOK_WARNING");
            if (config.LOGGER.WEBHOOKS.logger_error) disabledWebHooks.push("LOGGER_WEBHOOK_ERROR");

            Logger.warn(`config.js: LOGGER.writeToWebhook is enabled, but the following are not provided in the '.env' file: ${disabledWebHooks}`)
        }
    };

    /**
     * @param {import('../Structures/Command')} cmd
     */
    static validateCommand(cmd) {
        if (typeof cmd !== "object") {
            throw new TypeError("Command data must be an Object.");
        };
        if (typeof cmd.name !== "string" || cmd.name !== cmd.name.toLowerCase()) {
            throw new Error("Command name must be a lowercase string.");
        };
        if (typeof cmd.description !== "string") {
            throw new TypeError("Command description must be a string.");
        };
        if (cmd.cooldown && typeof cmd.cooldown !== "number") {
            throw new TypeError("Command cooldown must be a number");
        };
        if (cmd.category) {
            if (!Object.prototype.hasOwnProperty.call(CommandCategory, cmd.category)) {
                throw new Error(`Not a valid category ${cmd.category}`);
            };
        };


        // Validate Prefix Command Details
        if (cmd.prefCommand) {
            if (typeof cmd.prefCommand !== "object") {
                throw new TypeError("Command.prefCommand must be an object");
            };
            if (Object.prototype.hasOwnProperty.call(cmd.prefCommand, "enabled") && typeof cmd.prefCommand.enabled !== "boolean") {
                throw new TypeError("Command.prefCommand enabled must be a boolean value");
            };
            if (cmd.prefCommand?.enabled && typeof cmd.exe !== "function") {
                throw new TypeError("Missing 'exe' function");
            };
            if (
                cmd.command?.aliases &&
                (!Array.isArray(cmd.command.aliases) ||
                    cmd.command.aliases.some((ali) => typeof ali !== "string" || ali !== ali.toLowerCase()))
            ) {
                throw new TypeError("Command.prefCommand aliases must be an Array of lowercase strings.");
            };
            if (cmd.prefCommand?.usage && typeof cmd.prefCommand.usage !== "string") {
                throw new TypeError("Command.prefCommand usage must be a string");
            };
            if (cmd.prefCommand?.minArgsCount && typeof cmd.prefCommand.minArgsCount !== "number") {
                throw new TypeError("Command.prefCommand minArgsCount must be a number");
            };
            if (cmd.prefCommand?.subcommands && !Array.isArray(cmd.prefCommand.subcommands)) {
                throw new TypeError("Command.prefCommand subcommands must be an array");
            };
            if (cmd.prefCommand?.subcommands) {
                for (const sub of cmd.prefCommand.subcommands) {
                    if (typeof sub !== "object") {
                        throw new TypeError("Command.prefCommand subcommands must be an array of objects");
                    };
                    if (typeof sub.trigger !== "string") {
                        throw new TypeError("Command.prefCommand subcommand trigger must be a string");
                    };
                    if (typeof sub.description !== "string") {
                        throw new TypeError("Command.prefCommand subcommand description must be a string");
                    };
                };
            };
        };
    };
};
