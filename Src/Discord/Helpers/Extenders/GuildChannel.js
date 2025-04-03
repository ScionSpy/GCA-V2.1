const { GuildChannel, ChannelType } = require("discord.js");
const { messageSplitter } = require('../Utils');

/**
 * Check if bot has permission to send embeds
 */
GuildChannel.prototype.canSendEmbeds = function () {
    return this.permissionsFor(this.guild.members.me).has(["ViewChannel", "SendMessages", "EmbedLinks"]);
};

/**
 * Safely send a message to the channel
 * @param {string|import('discord.js').MessagePayload|import('discord.js').MessageOptions} content
 * @param {Object} [options]
 * @param {number} [options.seconds]
 * @param {String} [options.code]
 * @param {Boolean} [options.split]
 */
GuildChannel.prototype.sendSafely = async function (content, options = {}) {
    if (!content) throw new Error('NO_MESSAGE_CONTENT');
    if (this.type !== ChannelType.GuildText && this.type !== ChannelType.DM) throw new Error('INVALID_CHANNEL_TYPE');

    const perms = ["ViewChannel", "SendMessages"];
    if (content.embeds && content.embeds.length > 0) perms.push("EmbedLinks");
    if (!this.permissionsFor(this.guild.members.me).has(perms)) throw new Error('MISSING_PERMISSIONS');

    try {
        if (options.seconds) {
            const reply = await this.send(content);
            return setTimeout(() => reply.deletable && reply.delete().catch((ex) => { }), options.seconds * 1000);
        } else {
            if (options.split) content = messageSplitter(content);
            else content = [content];

            for (let x = 0; x < content.length; x++) {
                let str = content[x];
                if (options.code){
                    if (options.code === true) options.code = 'js';
                    str = `\`\`\`${options.code}\n${str}\`\`\``;
                };

                await this.send(str);
            };
        };
    } catch (ex) {
        this.client.logger.error(`GuildChannel.sendSafely`, ex.stack);
    };
};
