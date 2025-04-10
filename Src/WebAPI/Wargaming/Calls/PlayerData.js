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
 * @param {Boolean} exact look for "This" name exactly. (Default false)
 * @returns {Array<LookupData>}
 */
PlayerData.lookup = async function lookup(query, exact = false) {
    if (typeof query !== "string") throw new Error(`WargamingAPI.Player.lookup(query, exact = false)\n  'query' must be a string! got ${typeof query}\n`);
    if (typeof exact !== "boolean") throw new Error(`WargamingAPI.Player.lookup();\n  'exact' must be a boolean! got ${typeof exact}`);

    let queryData = [[]]
    if (exact) queryData = defineQuery(query, 100);
    else queryData[0][0] = query; // "startswith"
    let players = [];

    for (let x = 0; x < queryData.length; x++) {
        for (let y = 0; y < queryData[x].length; y++) {
            let q = queryData[x][y];
            if (q.length < 3 || q.length > 24) throw new Error(`WargamingAPI.Player.lookup(query = '${q}', exact = ${exact})\n  Queries must have a minimum character limit of 3, or a maximum count of 24!\n`);
            if (!exact && q.includes(',')) throw new Error(`WargamingAPI.Player.lookup(query = '${q}', exact = ${exact})\n  Non-Exact Queries must NOT have commas.\n`);
        };

        let results = await API.makeAPICall('wows/account/list/', `type=${exact ? 'exact' : 'startswith'}&search=${queryData[x].join(',')}`);

        if (results.status === "error") throw new Error(`WargamingAPI.Player.lookup(query='${results.error.value}', exact=${exact}) -> ` + await API.handelApiError(results.error, 'account/list'));
        else players = players.concat(results.data);
    };

    return players;
};


/**
 *
 * @param {String} query Account ID, or list of account ID's seperated with ','
 * @param {String} authToken Authorization Token
 * @returns {Array<Array<PlayerDetails>>}
 */
PlayerData.getDetails = async function getDetails(query, authToken) {
    if (typeof query === "number" && query.toString().length >= 10) query = `${query}`;
    else if (Array.isArray(query)) query = query.join(",");
    if (typeof query !== "string") throw new Error(`WargamingAPI.Player.getDetails();\n  'query' must be an array of strings, or a string! got ${typeof query}\n`);
    if (typeof authToken !== "string") throw new Error(`WargamingAPI.Player.getDetails(); 'authToken' must be a string! got ${typeof authToken}`);

    let queryData = [[]]
    if (query.includes(',')) queryData = defineQuery(query, 100);
    else queryData[0][0] = query; // "startswith"
    let players = [];

    for (let x = 0; x < queryData.length; x++) {
        for (let y = 0; y < queryData[x].length; y++) {
            let q = queryData[x][y];
            if (isNaN(q)) throw new Error(`WargamingAPI.Player.getDetails(query = '${q}')\n  queries must be a string of Numbers! got ${typeof q} : ${q}\n`);
        };

        let results = await API.makeAPICall('wows/account/info', `account_id=${queryData[x].join(',')}`, authToken);

        if (results.status === "error") throw new Error(`WargamingAPI.Player.getDetails(query='${results.error.value}') -> ` + await API.handelApiError(results.error, 'account/info'));
        else players = players.concat(results.data);
    };

    return players;
};



/**
 *
 * @param {String} query Account ID, or list of account ID's seperated with ','
 * @param {Boolean} clanExtra Returns player ClanData if they're currently in a clan.
 * @param {String} authToken Authorization Token
 * @returns {Array<Array<PlayerClanInfo>>}
 */
PlayerData.getClanInfo = async function getClanInfo(query, clanExtra = '', authToken) {
    if (typeof query === "number" && query.toString().length >= 10) query = `${query}`;
    else if (Array.isArray(query)) query = query.join(",");
    if (typeof query !== "string") throw new Error(`WargamingAPI.Player.getClanInfo();\n  'query' must be an array of strings, or a string! got ${typeof query}\n`);
    if (typeof authToken !== "string") throw new Error(`WargamingAPI.Player.getClanInfo(); 'authToken' must be a string! got ${typeof authToken}`);

    let queryData = [[]]
    if (query.includes(',')) queryData = defineQuery(query, 100);
    else queryData[0][0] = query; // "startswith"
    let players = [];

    for (let x = 0; x < queryData.length; x++) {
        for (let y = 0; y < queryData[x].length; y++) {
            let q = queryData[x][y];
            if (isNaN(q)) throw new Error(`WargamingAPI.Player.getClanInfo(query = '${q}')\n  queries must be a string of Numbers! got ${typeof q} : ${q}\n`);
        };

        if (clanExtra) clanExtra = `&extra=clan`;
        let results = await API.makeAPICall('wows/clans/accountinfo', `account_id=${queryData[x].join(',')}${clanExtra}`, authToken);

        if (results.status === "error") throw new Error(`WargamingAPI.Player.getClanInfo(query='${results.error.value}') -> ` + await API.handelApiError(results.error, 'clans/accountinfo'));
        else players = players.concat(results.data);
    };

    return players;
};
