/**
 * @param {import('../../Structures').BotClient} client
 * @param {string} message
 */
module.exports = async (client, message) => {
    client.logger.warn(`Client Warning: ${message}`);
};
