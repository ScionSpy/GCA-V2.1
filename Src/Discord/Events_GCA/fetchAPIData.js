const { players } = require('../../Database/API.js');
const { DbClan, DbClanMember, DbPlayer } = require('../../Database/Classes/index.js');
const { BotClient } = require('../Structures');


/**
 * Fetch data from the WG API, and update our clans/player lists with the new data.
 * @param {import('../Structures').BotClient} client
 */
module.exports = async function updateClansAndPlayers(client){

    let ApiData = collectAPIData(client);

    let results = await updateDatabase(client, ApiData);

    // if any clans or players are discovered, this will display their data.
    let discovered;
    if (results.missing_players || results.missing_clans) discovered = await syncMissing(client, { clans: results.clans, players: results.players, missing_clans:results.missing_clans, missing_players: results.missing_players });


    // Run Player Updater/Watcher.
    // Run Clan Updater/Watcher.

    //  In this manner, the Player watcher is fired first.
    // // [WATCHER-PLAYER] (ShadowSpyy) has left [G-C-A]
    // // [Watcher-CLAN] (G-C-A) BejebaSpy has left the clan.
    // // [Watcher-CLAN] (G-C-A) Gemini66 has left the clan.
    // // // Watcher-Clan Does NOT announce "ShadowSpyy" as Watcher-Player already announced him.


    return client.emit("APIDataFetched");
};

function hasDifferingMembers(arr1, arr2) {
    if (arr1.length !== arr2.length) {
        return false;
    };

    const arr1Sorted = [...arr1].sort();
    const arr2Sorted = [...arr2].sort();

    for (let i = 0; i < arr1Sorted.length; i++) {
        if (arr1Sorted[i] !== arr2Sorted[i]) {
            return false;
        };
    };

    return true;
};



async function updateDatabase(client, Data){

    let { Clans, Players } = Data;

    // List of clan's we have in our DB.
    let clan_ids = [];

    // List of player's we /Should/ have in our DB.
    // // These are players in every clan we've seen.
    let cPlayer_ids = [];
    let pPlayer_ids = [];

    let clan_updates = {};
    let player_updates = {};

    // Check for Clan updates
    for (const key in Clans) {
        let clanApi = Clans[key];
        clan_ids.push(key);
        cPlayer_ids.concat(clanApi.members_ids);

        let clanDb = client.Clans.get(key);
        let hasUpdated = false;
        let data = {};

        // Check and see if the leader changed.
        if (clanApi.leader_id !== clanDb.leader) {
            data['leader'] = { old: clanDb.leader, new: clanApi.leader_id };
            await clanDb.setLeader(clanApi.leader_id);
        };

        // Check and see if this clan's name was changed.
        if (clanApi.name !== clanDb.name) {
            data['name'] = { old: clanDb.name, new: clanApi.name };
            await clanDb.setName(clanApi.name, clanDb.leader);
        };

        // Check and see fi this clan's tag was changed.
        if (clanApi.tag !== clanDb.tag) {
            data['tag'] = { old: clanDb.tag, new: clanApi.tag };
            await clanDb.setTag(clanApi.tag, clanDb.leader);
        };

        //Check and see if anyone was added or removed from the clan.
        if (hasDifferingMembers(clanDb.members, clanApi.members_ids)) {
            let results = { left: [], joined: [] };

            // let's see if anyone has left the clan since our last check.
            for (let x = 0; clanDb.members.length; x++) {
                let mem = clanDb.members[x];
                if (!clanApi.members_ids.includes(mem)) results.left.push(mem);
            };

            // let's see if anyone has joined the clan since our last check.
            for (let x = 0; clanApi.members.length; x++) {
                let mem = clanApi.members_ids[x];
                if (!clanDb.members.includes(mem)) results.joined.push(mem);
            };

            data['members'] = { old: clanDb, new: clanApi, changes: results };
            await clanDb.setMembers(clanApi.members_ids);
        };


        // If we have updates, submit this clan, and its changes, to the updates list.
        if (hasUpdated) clan_updates[clanDb.id] = data;
    };

    let missing_clans = [];

    // Check for Player updates
    for (const key in Players) {
        let playerApi = Players[key];

        if (pPlayer_ids.includes(playerApi.account_id)) {
            client.logger.webError(`Events.GCA.updateClansAndPlayers(); Player.id<${playerApi.account_id}> already exists in {pPlayer_ids}!  Likely duplicate database entry for this user!`);
        } else {
            pPlayer_ids.push(key);
        };

        let playerDb = client.Players.get(key);
        let hasUpdated = false;
        let data = {};


        if (playerApi.nickname !== playerDb.name) {
            data['name'] = { old: playerDb.name, new: playerApi.name };
            await playerDb.setName(playerApi.name);
        };


        if (playerApi.logout_at !== playerDb.getLastLogout()) {
            // Do not log this change.
            await playerDb.setLastLogout(playerApi.logout_at);
        };


        if (playerApi.last_battle_time !== playerDb.getLastBattleTime()) {
            // Do not log this change.
            await playerDb.setLastBattleTime(playerApi.last_battle_time);
        };


        /*if (!playerApi.hidden_profile) {
            // Do not log any changes in this group.

            //
        };*/

        if (playerApi.clan?.clan_id !== playerDb.clan_id) {
            data['clan_id'] = { old: playerDb.clan_id, new: playerApi.clan.clan_id };
            if (!clan_ids.includes(playerApi.lan.clan_id)) missing_clans.push(playerApi.clan.clan_id);

            let joined = Date.now();
            if (playerApi.clan.clan_id) joined = playerApi.clan.joined_at;
            await playerDb.setClan(playerApi.clan.clan_id, joined);
        };

        if (playerApi.clan?.rank !== playerDb.rank) {
            data['clan_rank'] = { old: playerDb.rank, new: playerApi.clan.rank };

            await playerDb.setRank(playerApi.clan.rank);
        };

        // If we have updates, submit this Player, and their changes, to the updates list.
        if (hasUpdated) player_updates[playerDb.id] = data;
    };


    // Verify all players within {Clans.members_ids} exists within {Players}
    // // If not, fetch the additional members, add them to the Database.Players table.
    /** @type {Array<Number>} */
    let missing_players = [];
    for (let x = 0; x < cPlayer_ids.length; x++) {
        if (!pPlayer_ids.includes(cPlayer_ids[x])) missing_players.push(cPlayer_ids[x]);
    };

    return { clan_updates, player_updates, clans: clan_ids, players: pPlayer_ids, missing_clans, missing_players };
};

/**
 *
 * @param {BotClient} client
 * @param {Object} Data
 * @param {Array<Number>} Data.clans - Clans we already have.
 * @param {Array<Number>} Data.players - Players we already have.
 * @param {Array<Number>} Data.missing_clans - Clans we need to fetch.
 * @param {Array<Number>} Data.missing_players - Players we need to fetch.
 */
async function syncMissing(client, Data) {

    let clan_ids = Data.clans;

    // List of player's we've seen in these new Clans, and need to add to our Database.
    let cPlayer_ids = [];

    // List of players we have in the database.
    // // Cross reference our new clans with this list to make sure we don't miss anyone.
    let pPlayer_ids = Data.players;

    // Any new Clans or Players we see will be added here.
    let newData = { clans: [], players: [] };

    // Much of this is similar to 'updateDatabase', however we're creating classes and saving them to the Client level and DB.
    let apiData = await collectAPIData(client, { missing_clans: Data.missing_clans, missing_players: Data.missing_players});



    for (const key in apiData.Clans) {
        let clan = new DbClan(apiData[key]);
        client.Clans.set(clan.id, clan);

        cPlayer_ids.concat(clan.members);
        newData.clans.push(clan.id);
        clan_ids.push(clan.id);
    };



    let missing_clans = [];

    for (const key in apiData.Players) {
        let apiPlayer = apiData.Players[key];

        if (pPlayer_ids.includes(apiPlayer.account_id)) {
            client.logger.webError(`Events.GCA.updateClansAndPlayers(); Player.id<${apiPlayer.account_id}> already exists in {pPlayer_ids}!  Likely duplicate database entry for this user!`);
        } else {
            pPlayer_ids.push(key);
        };


        let player;

        if (!player.clan) {
            player = new DbPlayer(apiPlayer);
        } else {
            player = new DbClanMember(apiPlayer);
            if (!clan_ids.includes(player.clan_id)) missing_clans/push(player.clan_id);
        };

        client.Players.set(player.id, player)
        newData.players.push(player);
    };


    // Verify all players within {Clans.members_ids} exists within {Players}
    // // If not, fetch the additional members, add them to the Database.Players table.
    /** @type {Array<Number>} */
    let missing_players = [];
    for (let x = 0; x < cPlayer_ids.length; x++) {
        if (!pPlayer_ids.includes(cPlayer_ids[x])) missing_players.push(cPlayer_ids[x]);
    };



    // if we have any missing data, collect it.
    let discovered = { missing_clans: [], missing_players: [] };
    if (missing_clans.length > 0 || missing_players.length > 0) discovered = syncMissing(client, { clans: clan_ids, players: pPlayer_ids, missing_clans, missing_players });

    // merge any discovered data, with our current discovered data.
    if (discovered.missing_clans.length > 0) missing_clans.concat(discovered.missing_clans);
    if (discovered.missing_players.length > 0) missing_players.concat(discovered.missing_players);

    // return our discovered data.
    return { missing_clans, missing_players };
};



/**
 * Fetch data from the WG API;
 *
 * @async
 * @param {import('../Structures').BotClient} client
 * @param {Object} data
 * @param {Array<Number>} data.missing_clans
 * @param {Array<Number>} data.missing_players
 * @returns {{
 *      Clans: [Clan_Info],
 *      Players: [PlayerAPIData]
 * }}
 */
async function collectAPIData(client, data){
    let apiClanData;
    let apiPlayerDetails;
    let apiPlayerClanDetails;

    if (!data) {
        let clansArray = client.Clans.map( /** @param {ClanSchema} clan */ clan => { return clan.id });
        let playersArray = client.Players.map( /** @param {PlayerSchema} player */ player => { return player.id });

        apiClanData = client.API.WoWs.Clans.getDetails(clansArray);
        apiPlayerDetails = client.API.WoWs.Players.getDetails(playersArray);
        apiPlayerClanDetails = client.API.WoWs.Players.getClanInfo(playersArray, false);

    } else {

        apiClanData = client.API.WoWs.Clans.getDetails(data.missing_clans);
        apiPlayerDetails = client.API.WoWs.Players.getDetails(data.missing_players);
        apiPlayerClanDetails = client.API.WoWs.Players.getClanInfo(data.missing_players, false);
    };

    /** @type {[Clan_Info]} */
    let Clans = {};
    /** @type {[PlayerAPIData]} */
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
