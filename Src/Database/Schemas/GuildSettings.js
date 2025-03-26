

/**
 * A Discord Guild's settings as represented on the database.
 * @typedef {Object} GuildSettingsSchema
 *
 * @property {String} id Discord GuildId
 * @property {Boolean} available A flag indicating this client's presence within the guild.
 * @property {String} prefix This Guild's client prefix.
 * @property {String} invite This Guilds invite created by the client.
 *
 * @property {Number} clan_id This Guilds bound Wargaming Clan ID
*/
