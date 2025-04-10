const { defineQuery } = require('../Utils.js');
const WargamingAPI = require('../API');
const API = new WargamingAPI();

const ClanData = {};
module.exports = ClanData;


/**
 * Find a clan by name or tag.
 * @param {String[] | String} query query to look for.
 * @returns {Clan_Lookup[]}
 */
ClanData.lookup = async function clanLookup(query) {
    if (typeof query === "number" && query.toString().length >= 10) query = `${query}`;
    else if (Array.isArray(query)) query = query.join(",");
    if (typeof query !== "string") throw new Error(`WargamingAPI.Clan.lookup();\n  'query' must be an array of strings, or a string! got ${typeof query}\n`);
    if (query.length < 2) throw new Error(`WargamingAPI.Clan.lookup();\n  'query' must have a minimum character limit of 2.`);

    let results = await API.makeAPICall('wows/clans/list/', `search=${query}`);

    if (results.status === "error") throw new Error(`WargamingAPI.Clan.lookup(query) -> ` + await API.handelApiError(results.error, 'clans/list'));

    return results.data;
};


/**
 *
 * @param {String} query
 * @param {String} authToken Authorization Token
 * @returns {Array<Array<Clan_Info>>}
 */
ClanData.getDetails = async function getClanDetails(query, authToken) {
    if (typeof query === "number" && query.toString().length >= 10) query = `${query}`;
    else if (Array.isArray(query)) query = query.join(",");
    if (typeof query !== "string") throw new Error(`WargamingAPI.Clan.getDetails();\n  'query' must be an array of strings, or a string! got ${typeof query}\n`);
    if (typeof authToken !== "string") throw new Error(`WargamingAPI.Clan.getDetails(); 'authToken' must be a string! got ${typeof authToken}`);

    let queryData = [[]]
    // in the event we're trying to lookup more than 100 clans, devide them up into groups of 100.
    // // WGAPI limits the query to 100.
    if (query.includes(',')) queryData = defineQuery(query, 100);
    else queryData[0][0] = query; // "startswith"

    /**
     * @type {Clan_Info[]}
     */
    let clans = [];

    for (let x = 0; x < queryData.length; x++) {

        // Verify that every entity is a Number, defined as a string.
        for (let y = 0; y < queryData[x].length; y++) {
            let q = queryData[x][y];
            if (isNaN(q)) throw new Error(`WargamingAPI.Clan.getDetails(query = '${q}')\n  queries must be a string of Numbers! got ${typeof q} : ${q}\n`);
        };

        let results = await API.makeAPICall('wows/clans/info', `extra=members&clan_id=${queryData[x].join(',')}`, authToken);

        if (results.status === "error") throw new Error(`WargamingAPI.Clan.getDetails(query='${query}') -> Sent query=${results.error.value}` + await API.handelApiError(results.error, 'clans/info'));
        else clans = clans.concat(results.data);
    };

    return clans;
};


//#region Clan Applications

/**
 * @param {String} authToken Authorization Token
 * @returns {Array<ApplicationData>}
 */
ClanData.getApplications = async function getInviteApplications(authToken) {
    let query = "battle_type=pvp&order=-updated_at&offset=0&limit=100";

    if (!authToken) throw new Error('\'ClanData.getApplications();\' an Authorization Token is required for this function!');

    let results = await API.makeAPICall('api/recruitment/active_clan_applications/', query, authToken);

    if (results.applications) return results.applications;
    else return results;
};


__acceptApplicationError = async function acceptApplicationError(results) {
    const additionalInfo = results.additional_info || {};
    const reason = (results.title || '').toLowerCase();

    let errorResponse = '';
    switch (reason) {
        case 'account_banned':
            errorResponse = "Applicant's account is permamently banned.";
            break;

        case 'account_in_cooldown':
            errorResponse = "Applicant's is currently on clan_cooldown. | " + additionalInfo.expires_at;
            break;

        case 'application_is_not_active':
            errorResponse = `Applicant's application is no longer active. ${additionalInfo.status ? ` | ${additionalInfo.status}` : ''}`;
            break;

        case 'account_already_in_clan':
            errorResponse = "Applicant has joined a different clan.";
            break;

        case 'insufficient_permissions':
            errorResponse = "You do not have permission to accept this application. Please accept from in-game or using the [browser](https://clans.worldofwarships.com/requests).| <@213250789823610880> Your Auth_Token has expired!!";
            break;

        case 'clan_is_full':
            errorResponse = "G-C-A does not have sufficiant space for this member! Our clan is full!";
            break;

        default:
            errorResponse = "Unknown Error: ```js\n" + JSON.stringify(results, null, 4) + "\n```";
    };

    let Data = {
        title: results.title,
        description: results.description,
        decodedResponse: errorResponse
    };
    Data.additional_info = results.additional_info ? results.additional_info : undefined;

    Data.decodedResponse = errorResponse;
    return Data;
};

__declineApplicationError = async function declineApplicationError(results) {
    const reason = results.additional_info?.reason;
    let errorResponse = '';
    if (reason === 'application_is_not-Active') {
        errorResponse = `Applicant's application is no longer active. ${additionalInfo.status ? ` | ${additionalInfo.status}` : ''}`;

    } else if (reason === 'account_already_in_clan') {
        errorResponse = "Applicant has joined a different clan.";

    } else {
        errorResponse = "Unknown Error: ```js\n" + JSON.stringify(results, null, 4) + "\n```";
    };

    let Data = {
        title: results.title,
        description: results.description,
        decodedResponse: errorResponse
    };
    Data.additional_info = results.additional_info ? results.additional_info : undefined;

    Data.decodedResponse = errorResponse;
    return Data;
};

/**
 * @param {Object} data
 * @param {Number} data.id
 * @param {String} data.status Status to send.
 * * "Accepted" | "declined"
 * @param {String} authToken Authorization Token
 * @returns {Application.Conf|Application.ConfErr}
 */
ClanData.sendApplicationResponse = async function sendApplicationResponse(data, authToken) {

    if (!authToken) throw new Error('\'ClanData.sendApplicationResponse(authToken, data);\' an Authorization Token is required for this function!');

    let results = await API.makeApiCall_PATCH('api/recruitment/applications/' + data.id + '/', { status: data.status }, authToken);

    if (results.title || results.error) {
        if (data.status === "accepted") return await __acceptApplicationError(results);
        else return results; //await this.declineApplicationError(results);
    } else return results;
};



//#endregion
