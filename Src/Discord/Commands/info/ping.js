const { EmbedBuilder } = require('discord.js');

/** @type {import('../../Structures/Command')} */
module.exports = {
    name: "ping",
    description: "Gets the Clients response time.",
    enabled: true,
    category: "INFO",
    prefCommand: { enabled: true },
    slashCommand: { enabled: false  },
    
    exe: (message, args, data) => {

        let apiMS = message.client.ws.ping == -1 ? 'Not Pinged' : `${message.client.ws.ping}ms`;
        let cMS = message.createdTimestamp - Date.now();

        let embed = new EmbedBuilder();
        embed.setTitle("🏓 Pong!");
        embed.setDescription(`\`\`\`js\n\ \ \ API : ${apiMS}\nClient : ${cMS}ms\`\`\``);


        message.replySafely({embeds: [embed]});
    },

    /**
 * Used to run a Slash command.
 * @param {ApplicationCommand} interaction
 * @param {import('../../../Database/Classes/GuildSettings.js')} settings
 */
    slashExe: (interaction, data) => { },
};
