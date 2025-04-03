const config = require('../../../../config');
const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
//const Database = require('../../../Database/index');
const Database = {};
const Utils = require('../../Helpers/Utils');


module.exports = {
    name: "eval",
    description: "evaluates something.",
    enabled: true,
    category: "DEV",
    prefCommand: {
        enabled: true,
        aliases: ['evald'],
        usage: "<script>",
        minArgs: 1,
    },

    /**
     *
     * @param {import('discord.js').Message} message
     * @param {String[]} args
     * @param {import('./GuildSettings.js')} settings
     */
    exe: async (message, args, data) => {
        const input = args.join(" ");

        if (!input) return message.channel.send("Please provide the code I'm evaluating...");

        let response;
        try {
            //Define Eval phrases.
            const bot = message.client;
            const DB = Database;
            const utils = Utils;
            const e = new EmbedBuilder();

            let output = eval(input);

            output = output;

            response = await buildSuccessResponse(output, message.client);
        } catch (ex) {
            response = buildErrorResponse(ex);
        };



        if (typeof response === "string") await message.channel.sendSafely(response, { code: 'js', split: true });
        else await message.channel.send(response);
    },
};


const buildSuccessResponse = async (output, client) => {

    if (output && output.constructor.name == "Promise") output = await output;


    // Token protection
    output = require("util").inspect(output, { depth: 3 })
        .replaceAll(client.token, 'REDACTED [ CLIENT_TOKEN ]')

        // Database
        .replaceAll(process.env.DATABASE_URI, 'REDACTED [ MONGODB_URI ]')
        .replaceAll(process.env.DATABASE_USERNAME, 'REDACTED [ MONGODB_USERNAME ]')
        .replaceAll(process.env.DATABASE_PASSWORD, 'REDACTED [ MONGODB_PASSWORD ]')

        // WG API
        .replaceAll(process.env.API_WARGAMING_APPID, 'REDACTED [ API_WARGAMING_APPID ]')
        .replaceAll(process.env.API_WARGAMING_AUTHTOKEN, 'REDACTED [ API_WARGAMING_AUTHTOKEN ]')

        // Webhooks
        if (process.env.LOGGER_WEBHOOK_CONSOLE) output.replaceAll(process.env.LOGGER_WEBHOOK_CONSOLE, 'REDACTED [ LOGGER_WEBHOOK_CONSOLE ]')
        if (process.env.LOGGER_WEBHOOK_DEBUG) output.replaceAll(process.env.LOGGER_WEBHOOK_DEBUG, 'REDACTED [ LOGGER_WEBHOOK_DEBUG ]')
        if (process.env.LOGGER_WEBHOOK_WARNING) output.replaceAll(process.env.LOGGER_WEBHOOK_WARNING, 'REDACTED [ LOGGER_WEBHOOK_WARNING ]')
        if (process.env.LOGGER_WEBHOOK_ERROR) output.replaceAll(process.env.LOGGER_WEBHOOK_ERROR, 'REDACTED [ LOGGER_WEBHOOK_ERROR ]')
    ;

    /*const embed = new MessageEmbed()
        .setAuthor({ name: "📤 Output" })
        .setDescription("```js\n" + (output.length > 4096 ? `${output.substr(0, 4000)}...` : output) + "\n```")
        .setColor("Random")
        .setTimestamp(Date.now());

    return embed;*/

    return output;
};

const buildErrorResponse = (err) => {
    /*const embed = new MessageEmbed();
    embed
        .setAuthor({ name: "📤 Error" })
        .setDescription("```js\n" + (err.length > 4096 ? `${err.substr(0, 4000)}...` : err) + "\n```")
        .setColor(EMBED_COLORS.ERROR)
        .setTimestamp(Date.now());

    return embed;*/
    if (!err.stack && typeof err !== "string") return JSON.stringify(err, null, 4);
    else if (!err.stack) return err;
    else return err.stack;
};
