

/**
 * @typedef {object} Player
 * @property {Number} id Player's Wargaming ID.
 * @property {String} name Player's Name.
 * @property {String} [discord_id] The Player's Discord ID.
 * @property {Boolean} [inactive] True if this player is currently inactive.
 * @property {Boolean} [loa] True if this player is currently on LoA.
 * @property {Statistics} stats This player's statistics.
 */

/**
 * @typedef {object} Statistics
 * @property {Number} created_at The time at which this Player was created.
 * @property {Number} lastBattle The time at which this Player finished his last battle.
 * @property {Number} lastLogOut The time at which this Player last Logged Out.
 * @property {Number} [battles] The Number of battles this Player has played.
 * @property {Number} [distance] The Number of KM this player has traveled.
*/


module.exports = Player;
