const DB_API = require('../DB_API');

module.exports = class API_Client extends DB_API {
    constructor(){ super(); };

    /**
     * Checks the database for the provided {rewardCode}
     * @param {string} rewardCode
     * @returns boolean
     */
    checkForRewardCode = async function checkForRewardCode(rewardCode, raw){
        let results = await this._Get("RewardCodes", { rewardCode: rewardCode.toUpperCase() });
        if (raw) return results;
        if (results) return true;
        else return false;
    };

    /**
     * Submits a WG RewardCode to the database.
     * @param {Object} RewardData
     * @returns {Promise}
     *
     * @todo Create a 'RewardCode' class for validation.
     */
    submitRewardCode = async function submitRewardCode (RewardData){
        return await this._Post("RewardCodes", RewardData);
    };
};
