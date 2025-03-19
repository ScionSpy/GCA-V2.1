/**
 * @param {import('../Structures').BotClient} client
 * @param {Error} error
 */
module.exports = async (client, error) => {
    client.logger.error(`Client Error`, error.stack);
};
