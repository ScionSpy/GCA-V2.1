//const WGAPI = require('../../WebAPI/Wargaming/index.js');


/**
 * Fetch data from the WG API, and update our clans/player lists with the new data.
 * @param {import('../Structures').BotClient} client
 */
module.exports = async function updateClansAndPlayers(client){

    let clansArray = client.Clans.map( /** @param {ClanSchema} clan */ clan => { return clan.id });
    let playersArray = client.Players.map( /** @param {PlayerSchema} player */ player => { return player.id });

    let announcedPlayers = [];

    //let apiClanData = client.API.WoWs.Clans.getDetails(clansArray);





    return client.emit("APIDataFetched");
};
