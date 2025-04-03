const Logger = require('../../../Structures/Logger/webLogger.js');
const { Guild } = require("discord.js");



module.exports = class SupportServer {
    logger;

    #bot;
    #guild;

    /**
     *
     * @param {import('../../Structures/BotClient')} client
     * @param {Guild} guild
     */
    constructor(client, guild){
        if (!client || !guild) throw new Error(`new SupportServer(client, guild); both of 'client' and 'guild' must be defined! recevied: ${typeof client} / ${typeof guild}`);

        this.#bot = client;
        this.#guild = guild;
        this.logger = new Logger(`SupportServer<${guild.id}>`);
    };

    async joinedGuild(guild){
        let msg = `SupportServer.joinedGuild(); JOINED GUILD :  (${guild.id}) ${guild.name}`;
        console.log(msg);
        try { this.#guild.channels.cache.get('1357190304251510895').sendSafely(msg);
        } catch (err) { this.logger.error(`joinedGuild( '${guild.id}' ); Unable to send message to channel! [ '1357190304251510895' ]\n >    ${err.stack}`); };
    };

    async leftGuild(guild) {
        let msg = `SupportServer.leftGuild(); LEFT GUILD : (${guild.id}) ${guild.name}`;
        console.log(msg);
        try { this.#guild.channels.cache.get('1357190304251510895').sendSafely(msg);
        } catch (err) { this.logger.error(`leftGuild( ' ${guild.id}' ); Unable to send message to channel! [ '1357190304251510895' ]\n >    ${err.stack}`); };
    };
};
