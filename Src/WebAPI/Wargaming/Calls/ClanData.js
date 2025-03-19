const { defineQuery } = require('../../Utils');
const WargamingAPI = require('../API');
const API = new WargamingAPI();

const ClanData = {};
module.exports = ClanData;


//#region Clan Applications

/**
 * @param {String} authToken Authorization Token
 * @returns {Array<ApplicationData>}
 */
ClanData.getApplications = async function getInviteApplications(authToken) {
    let query = "battle_type=pvp&order=-updated_at&offset=0&limit=100";

    let auth = process.env.API_WARGAMING_ADMINAUTH ? process.env.API_WARGAMING_ADMINAUTH : authToken;
    if (!auth) throw new Error('\'ClanData.getApplications(authToken);\' an Authorization Token is required for this function!');

    let Cookies = `wsauth_token=${auth}`;

    let results = await API.makeAPICall('api/recruitment/active_clan_applications/', query, Cookies);

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
 * @param {String} authToken Authorization Token
 * @param {Object} data
 * @param {Number} data.id
 * @param {String} data.status Status to send.
 * * "Accepted" | "declined"
 * @returns {Application.Conf|Application.ConfErr}
 */
ClanData.sendApplicationResponse = async function sendApplicationResponse(authToken, data) {

    let auth = process.env.API_WARGAMING_ADMINAUTH ? process.env.API_WARGAMING_ADMINAUTH : authToken;
    if (!auth) throw new Error('\'ClanData.sendApplicationResponse(authToken, data);\' an Authorization Token is required for this function!');

    let Cookies = `wsauth_token=${auth}`;


    let results = await API.makeApiCall_PATCH('api/recruitment/applications/' + data.id + '/', { status: data.status }, Cookies);

    if (results.title || results.error) {
        if (data.status === "accepted") return await __acceptApplicationError(results);
        else return results; //await this.declineApplicationError(results);
    } else return results;
};



//#endregion

