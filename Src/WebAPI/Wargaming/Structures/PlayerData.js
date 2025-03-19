/**
 * @typedef {Object} LookupData
 * @property {String} nickname
 * @property {Number} account_id
*/

/**
 * @typedef {Object} PlayerDetails
 * @property {Number} account_id Player's account ID.
 * @property {Number} nickname Players Name.
 * @property {Number} created_at Account creation date.
 * @property {Number} updated_at Account updated at.
 *
 * @property {Number} last_battle_time Time of the Player's last battle.
 * @property {Number} logout_at Time of player's last logout.
 *
 * @property {Boolean} hidden_profile Is this player's profile hidden
 * @property {Null} karma Depreciated.
 * @property {PlayerDetails.statistics|Null} statistics
 *
 * @property {Number|Null} leveling_tier
 * @property {Number|Null} leveling_points Required for leveling_tier, total of all battles played.
*/
/**
 * @typedef {Object} PlayerDetails.statistics
 * @property {Number} battles
 * @property {Number} distance
 * @property {PlayerDetails.statistics.pvp} pvp
*/
/**
 * @typedef {Object} PlayerDetails.statistics.pvp
 */


/**
 * @typedef {Object} PlayerClanInfo
 * @property {Number} account_id Player's account ID.
 * @property {Number} joined_at Player's account creation date (In seconds)
 * @property {String} account_name Player's account name.
 * @property {Number|Null} clan_id Player's account ID.
 * @property {String|Null} role Player's clan role.
 * @property {PlayerClanInfo.Clan} clan
*/
/**
 * @typedef {Object} PlayerClanInfo.Clan
 * @property {Number} clan_id Id of the Clan.
 * @property {Number} created_at Clan's creation date. (In seconds)
 * @property {String} tag Clan's Clan Tag.
 * @property {String} name Clan's Name.
 * @property {Number} members_count Number of players in this clan.
*/
