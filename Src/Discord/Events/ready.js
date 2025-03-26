
/**
 * @param {import('../Structures').BotClient} client
 */
module.exports = async (client) => {
    client.logger.webConsole(`Logged in as ${client.user.tag}! \`(${client.user.id})\`\n\nClient took ${Date.now() - client.startUpAt}ms to start!`);
    delete client.startUpAt;



    // Register Interactions
    /*if (client.config.INTERACTIONS.SLASH || client.config.INTERACTIONS.CONTEXT) {
        if (client.config.INTERACTIONS.GLOBAL) await client.registerInteractions();
        else await client.registerInteractions(client.config.INTERACTIONS.TEST_GUILD_ID);
    }*/
    await client.registerInteractions('1126377465741324429');


    if (client.guilds.cache.size == 0) client.logger.warn(`Client is not in a Discord Guild! Invite: ${client.getInvite()}`);
};
