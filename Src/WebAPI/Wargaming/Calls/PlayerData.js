const { defineQuery } = require('../Utils');
const WargamingAPI = require('../API');
const API = new WargamingAPI();

const API_Errors = {
    'account/list': {
        'SEARCH_NOT_SPECIFIED': { code: 402, message: "SEARCH_NOT_SPECIFIED", description: "{Search} parameter not specified with no {account_id}" },
        'NOT_ENOUGH_SEARCH_LENGTH': { code: 407, message: 'NOT_ENOUGH_SEARCH_LENGTH', description: '{Search} parameter is not long enough. Allows value depends on {type} parameter.' },
        'SEARCH_LIST_LIMIT_EXCEEDED': { code: 407, message: 'SEARCH_LIST_LIMIT_EXCEEDED', description: 'Limit of specified names in {search} parameter exceeded (>100)' },
        'INVALID_SEARCH': { code: 407, message: 'INVALID_SEARCH', description: '{Search} exceeded the allowed 24 characters, or included invalid special characters!' }
    }
};



const PlayerData = {};
module.exports = PlayerData;


/**
 *
 * @param {String} query Search the WoWs players list for a name matching this, or starting with this.
 * @param {Boolean} exact look for "This" name exactly. (Default false = startswith "this")
 * @returns {Array<LookupData>}
 */
PlayerData.lookup = async function lookup(query, exact = false) {
    if (typeof query !== "string") throw new Error(`WargamingAPI.playerLookup(query, exact = false)\n  'query' must be a string! got ${typeof query}\n`);

    let queryData = [[]]
    if (exact) queryData = defineQuery(query, 100);
    else queryData[0][0] = query; // "startswith"
    let players = [];

    for (let x = 0; x < queryData.length; x++) {
        for (let y = 0; y < queryData[x].length; y++) {
            let q = queryData[x][y];
            if (q.length < 3 || q.length > 24) throw new Error(`WargamingAPI.playerLookup(query = '${q}', exact = ${exact})\n  Queries must have a minimum character limit of 3, or a maximum count of 24!\n`);
            if (!exact && q.includes(',')) throw new Error(`WargamingAPI.playerLookup(query = '${q}', exact = ${exact})\n  Non-Exact Queries must NOT have commas.\n`);
        };

        let results = await API.makeAPICall('wows/account/list/', `type=${exact ? 'exact' : 'startswith'}&search=${queryData[x].join(',')}`);

        if (results.status === "error") throw new Error(`WargamingAPI.playerLookup(query='${results.error.value}', exact=${exact}) -> ` + await API.handelApiError(results.error, 'account/list'));
        else players = players.concat(results.data);
    };

    return players;
};


/**
 *
 * @param {String} query Account ID, or list of account ID's seperated with ','
 * @returns {Array<Array<PlayerDetails>>}
 */
PlayerData.getDetails = async function getDetails(query) {
    if (typeof query !== "string" || query.length < 10) throw new Error(`WargamingAPI.getPlayerDetails(query)\n  'query' must be a string of clan ID's! got ${typeof query} : ${query} : length(${query.length}) !== 10\n`);

    let queryData = [[]]
    if (query.includes(',')) queryData = defineQuery(query, 100);
    else queryData[0][0] = query; // "startswith"
    let players = [];
    //console.log(queryData.length)
    for (let x = 0; x < queryData.length; x++) {
        for (let y = 0; y < queryData[x].length; y++) {
            let q = queryData[x][y];
            if (isNaN(q)) throw new Error(`WargamingAPI.getPlayerDetails(query = '${q}')\n  queries must be a string of Numbers! got ${typeof q} : ${q}\n`);
        };

        let results = await API.makeAPICall('wows/account/info', `account_id=${queryData[x].join(',')}`);

        if (results.status === "error") throw new Error(`WargamingAPI.getPlayerDetails(query='${results.error.value}') -> ` + await API.handelApiError(results.error, 'account/info'));
        else players = players.concat(results.data);
    };
    //console.log(players.length);
    return players;
};



/**
 *
 * @param {String} query Account ID, or list of account ID's seperated with ','
 * @param {Boolean} clanExtra Returns player ClanData if they're currently in a clan.
 * @returns {Array<Array<PlayerClanInfo>>}
 */
PlayerData.getClanInfo = async function getClanInfo(query, clanExtra = '') {
    if (typeof query !== "string" || query.length < 10) throw new Error(`WargamingAPI.getPlayerClanInfo(query)\n  'query' must be a string of clan ID's! got ${typeof query} : length(${query.length}) !== 10\n`);

    let queryData = [[]]
    if (query.includes(',')) queryData = defineQuery(query, 100);
    else queryData[0][0] = query; // "startswith"
    let players = [];

    for (let x = 0; x < queryData.length; x++) {
        for (let y = 0; y < queryData[x].length; y++) {
            let q = queryData[x][y];
            if (isNaN(q)) throw new Error(`WargamingAPI.getPlayerClanInfo(query = '${q}')\n  queries must be a string of Numbers! got ${typeof q} : ${q}\n`);
        };

        if (clanExtra) clanExtra = `&extra=clan`;
        let results = await API.makeAPICall('wows/clans/accountinfo', `account_id=${queryData[x].join(',')}${clanExtra}`);

        if (results.status === "error") throw new Error(`WargamingAPI.getPlayerClanInfo(query='${results.error.value}') -> ` + await API.handelApiError(results.error, 'clans/accountinfo'));
        else players = players.concat(results.data);
    };

    return players;

};
