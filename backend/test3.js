const { Client } = require('espn-fantasy-football-api/node');
const axios = require('axios');


//-------------- VAIRABLES --------------//
var leagueId = 759573
var espnS2 = "AEBNqHVhRAc2FgKmOJpzNAUmiRVE8IU0Lt3d9Prrx6izrE39auHhyfZ45iGEb%2FNudx8O7I2%2BPGxA2O%2BVA5DOI9sJEsCurPw2gSWLgmsOVWVNhlKj2TaSAttl6tQw%2B680V7V4cITNblBp%2FbbpYs88MNB41eMBfvVNeg%2BFKxuo4dhhkNzmiMgcTisY6bRWBCQjZSWfNopFBM378QC%2FzmK5MEM3%2Ffjs9HYV5NUDngJH0DTVUUxDoQG7M4ByoUD%2FoxbQLsw6RhlsC8SiKkJ%2BO456iiGm";
var SWID = "{9C5FB733-65CF-4FA2-8106-AD5CF157F4F6}";
//-------------- INIT --------------//
const myClient = new Client({ leagueId: leagueId });
myClient.setCookies({ espnS2: espnS2, SWID: SWID });
const getFreeAgents = async () => {
    const myTeams = await myClient.getFreeAgents({ seasonId: 2020, scoringPeriodId: 1 })
    console.log(myTeams)
}
const getBoxscoreForWeek = async () => {
    const myTeams = await myClient.getBoxscoreForWeek({ seasonId: 2020, scoringPeriodId: 1, matchupPeriodId: 1 })
    console.log(myTeams)
}
console.log("WAIT FOR THE RESULT")

getFreeAgents();
getBoxscoreForWeek();

// const getLeagueInfo = async () => {
//         const myTeams = await myClient.getLeagueInfo({ seasonId: 2020 })
//         console.log(myTeams);
// }
// getLeagueInfo();


