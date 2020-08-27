const { Client } = require('espn-fantasy-football-api/node');
(async () => {
        const leagueId = 72438126;
        const espnClient = new Client({ leagueId });
        const leagueInfo = await espnClient.getLeagueInfo({seasonId: 2020});
        console.log({leagueInfo})
})();