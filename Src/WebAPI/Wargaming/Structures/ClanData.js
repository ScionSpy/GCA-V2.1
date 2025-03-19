/**
 * @typedef {Object} Clan_Member
 * @property {Number} account_id
 * @property {String} account_name
 * @property {Number} joined_at
 * @property {String} role
*/

/**
 * @typedef {Object} Clan_Info
 * @property {Number} clan_id
 * @property {String} tag
 * @property {String} name
 * @property {Number} creator_id
 * @property {String} creator_name
 * @property {Number} leader_id
 * @property {String} leader_name
 * @property {Boolean} is_clan_disbanded
 * @property {Number | Null} renamed_at
 * @property {String | Null} old_tag
 * @property {String | Null} old_name
 * @property {Number} updated_at
 * @property {Number} members_count
 * @property {Array<Number>} members_ids
 * @property {Array<Clan_Member>} members
 * @property {String} description
*/

/**
 * @typedef {Object} ApplicationData
 * @property {String} game 'wows' for world of warships
 * @property {String} status active | expired | accepted | declined
 * @property {Date} expires_at Time at which the invite expires.
 * @property {Number} id WoWs Account ID *
 *
 * @property {Object} account Information regarding the invitee.
 * @property {Number|Null} account.clan_id Invitee's current clan ID.
 * @property {Array<>} account.bans Invitees previous bans.
 * @property {Number} account.id Invitee's Account ID.
 * @property {Date} account.in_clan_cooldown_till Is the Invitee currently in clan cooldown?
 * @property {Boolean} account.is_banned Is the Invitee Banned?
 * @property {String} account.name Invitee's name.
 *
 * @property {Object} statistics Stats of the player being invited
 * @property {Number} statistics.btl Number of account battles.
 * @property {Number} statistics.afb Average Frags per Battle.
 * @property {Number} statistics.aeb Average EXP per Battle.
 * @property {Number} statistics.rank 0-17, 17 = Clan Battle Access.
 * @property {Number|Null} statistics.season_rank
 * @property {Number} statistics.season_id
 * @property {Number} statistics.wb Win Rate
 * @property {Number} statistics.admg Average Damage per Battle.
 * @property {Number} statistics.abd
 *
 * @property {String|Null} comment
 * @property {Boolean} is_hidden_statistics
 * @property {Date} updated_at Time at which the invite was last updated.
 * @property {Boolean} is_banned
 * @property {Date} created_at Time at which the invite was created.
*/

/**
 * @typedef {Object} Application.Conf
 * @property {Number} clan_id
 * @property {Number} id Application ID
 * @property {Number} account_id
 */
/**
 * @typedef {Object} Application.ConfErr
 * @property {String} title Error Title
 * * APPLICATION_IS_NOT_ACTIVE |
 * @property {String} description Description of the error.
 * @property {Object} additional_data
 */
/**
 * @typedef {Object} Application.ConfErr.APPLICATION_IS_NOT_ACTIVE
 * @property {String} title Error Title
 * @property {String} description Description of the error.
 * @property {Object} additional_data
 * @property {String} additional_data.status Status of Application
 * * "accepted" | "declined" | "expired"
 */


/**
 * @typedef {Object} InviteData
 * @property {String} game 'wows' for world of warships
 * @property {String} status active | expired | accepted | declined
 * @property {Date} expires_at Time at which the invite expires.
 * @property {Number} id WoWs Account ID
 *
 * @property {Object} sender User who sent the invite.
 * @property {Number} sender.clan_id ID of the Sender's clan.
 * @property {Number} sender.id Account ID for the Sender.
 * @property {Boolean} sender.is_banned Is the sender currently banned from WoWs?
 * @property {String} sender.role The Sender's role in the clan.
 * @property {String} sender.name The Sender's name.
 *
 *
 * @property {Object} account Information regarding the invitee.
 * @property {Number|Null} account.clan_id Invitee's current clan ID.
 * @property {Array<>} account.bans Invitees previous bans.
 * @property {Number} account.id Invitee's Account ID.
 * @property {Date} account.in_clan_cooldown_till Is the Invitee currently in clan cooldown?
 * @property {Boolean} account.is_banned Is the Invitee Banned?
 * @property {String} account.name Invitee's name.
 *
 * @property {Object} statistics Stats of the player being invited
 * @property {Number} statistics.btl Number of account battles.
 * @property {Number} statistics.afb Average Frags per Battle.
 * @property {Number} statistics.aeb Average EXP per Battle.
 * @property {Number} statistics.rank 0-17, 17 = Clan Battle Access.
 * @property {Number|Null} statistics.season_rank
 * @property {Number} statistics.season_id
 * @property {Number} statistics.wb Win Rate
 * @property {Number} statistics.admg Average Damage per Battle.
 * @property {Number} statistics.abd
 *
 * @property {String|Null} comment
 * @property {Boolean} is_hidden_statistics
 * @property {Date} updated_at Time at which the invite was last updated.
 * @property {Boolean} is_banned
 * @property {Date} created_at Time at which the invite was created.
*/


/**
 * @typedef {Object} DivStars
 * @property {Array<String>} clanClanstarsCount Key Value pair of each members DivStars in-clan. key = account ID. (See DivStars/Clan Results)
 * @property {Array<DivStars.accountClanstars>} accountClanstars
 * @property {Array<DivStars.AccountRewards>} accountRewards
 * @property {Array<DivStars.RewardsInfo>} rewardsInfo key = stars needed for the reward. value = reward gained.
 */
/**
 * @typedef {Object} DivStars.accountClanstars
 * @property {Number} spaId Player ID of the user this div star was gotten from.
 * @property {Number} clanId Clan ID of the clan this divStar was obtained from.
 * @property {String} questId Mission ID this star was completed for.
 * * '1335c9ba-5e05-4cc2-a25c-10fc3a563e60' = "Win a Battle"
 */
/**
 * @typedef {Object} DivStars.AccountRewards
 * @property {Number} id
 * @property {Number} spaId
 * @property {Number} clanId
 * @property {Number} clanstarsCount
 * @property {String} status
 * @property {Date} claimedAt Date this reward was claimed at.
 * @property {Date} createdAt
 * @property {Date} updatedAt
 * @property {Number} seasonId
 */
/**
 * @typedef {Object} DivStars.RewardsInfo
 * @property {String} type Type of reward gained
 * * 'lootbox'|'signal'|elite_xp'|'steel'|'oil'
 * @property {Number|Null} id ID of the item-type rewarded.
 * @property {Number} amount Number of this type given.
 * @property {Null|Undefined} customisation
*/
