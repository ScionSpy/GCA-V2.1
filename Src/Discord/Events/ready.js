
/**
 * @param {import('../Structures').BotClient} client
 */
module.exports = async (client) => {
    client.logger.webConsole(`Logged in as ${client.user.tag}! \`(${client.user.id})\``);
    if (client.guilds.cache.size == 0) client.logger.warn(`Client is not in a Discord Guild! Invite: ${client.getInvite()}`);
};
