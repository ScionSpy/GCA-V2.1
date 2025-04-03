const { Guild } = require("discord.js");



module.exports = class SupportServer extends Guild {
    /**
     *
     * @param {import('../../Structures/BotClient')} client
     * @param {Guild} guild
     */
    constructor(client, guild){
        super(client, guild);
    };

    async joinedGuild(guild){
        let msg = `SupportServer.joinedGuild(); JOINED GUILD : ${guild.id}`;
        console.log(msg);
        this.channels.cache.get('1357190304251510895').send(msg);
    };

    async leftGuild(guild) {
        let msg = `SupportServer.leftGuild(); LEFT GUILD : ${guild.id}`;
        console.log(msg);
        this.channels.cache.get('1357190304251510895').send(msg);
    };
};
