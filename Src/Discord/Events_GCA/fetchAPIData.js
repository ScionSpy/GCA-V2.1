const { DbClan, DbPlayer } = require('../../Database/Classes/index.js');


/**
 * Fetch data from the WG API, and update our clans/player lists with the new data.
 * @param {import('../Structures').BotClient} client
 */
module.exports = async function updateClansAndPlayers(client){

    let { Players, Clans } = collectAPIData(client);



    return client.emit("APIDataFetched");
};


/**
 * Fetch data from the WG API;
 *
 * @async
 * @param {import('../Structures').BotClient} client
 * @returns {{
 *      Clans: [import('../../WebAPI/Wargaming/Structures/ClanData.js').Clan_Info],
 *      Players: [import('../../WebAPI/Wargaming/Structures/PlayerData.js').PlayerAPIData]
 * }}
 */
async function collectAPIData(client){
    let clansArray = client.Clans.map( /** @param {ClanSchema} clan */ clan => { return clan.id });
    let playersArray = client.Players.map( /** @param {PlayerSchema} player */ player => { return player.id });

    let apiClanData = client.API.WoWs.Clans.getDetails(clansArray);
    let apiPlayerDetails = client.API.WoWs.Players.getDetails(playersArray);
    let apiPlayerClanDetails = client.API.WoWs.Players.getClanInfo(playersArray, false);

    /** @type {[import('../../WebAPI/Wargaming/Structures/ClanData.js').Clan_Info]} */
    let Clans = {};
    /** @type {[import('../../WebAPI/Wargaming/Structures/PlayerData.js').PlayerAPIData]} */
    let Players = {};


    for (let x = 0; x < apiClanData.length; x++) {
        let batch = apiClanData[x];

        for (let y = 0; y < batch.length; y++) {
            let clan = batch[y];

            Clans[clan.clan_id] = clan;
        };
    };


    for (let x = 0; x < apiPlayerDetails.length; x++) {
        let batch = apiPlayerDetails[x];

        for (let y = 0; y < batch.length; y++) {
            let player = batch[y];

            Players[player.account_id] = player;
        };
    };

    for (let x = 0; x < apiPlayerClanDetails.length; x++) {
        let batch = apiPlayerClanDetails[x];

        for (let y = 0; y < batch.length; y++) {
            let player = batch[y];

            if (player.clan_id) Players[player.account_id].clan = {
                clan_id: player.clan_id,
                joined_at: player.joined_at,
                rank: player.role,
            }
        };
    };


    return { Clans, Players };
};
