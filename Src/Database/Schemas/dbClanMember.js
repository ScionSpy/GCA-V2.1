const PlayerDBSchema = require('./dbPlayer');

/**
 * @typedef {object} ClanMemberType
 * @property {ClanData} clan
 *
*/
/**
 * @typedef {PlayerDBSchema & ClanMemberType} ClanMemberSchema
 */

/**
 * @typedef {object} ClanData
 * @property {Number} id Clan ID.
 * @property {ClanData.RankList} rank Player rank in this clan.
 * @property {Number} joined Timestamp this player joined the clan.
*/

/**
 * @typedef {"private" | "officer" | "commissioned_officer" | "recruitment_officer" | "executive_officer" | "commander"} ClanData.RankList
*/
