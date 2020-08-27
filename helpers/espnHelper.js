const { Client, League } = require('espn-fantasy-football-api/node');

/**
 * Verify league ID using espn api
 * Returns league info if valid, otherwise null
 */
const verifyLeague = async (seasonId, leagueId) => {
  try {
    const espnClient = new Client({ leagueId });
    const leagueInfo = await espnClient.getLeagueInfo({ seasonId });
    return leagueInfo;
  } catch (error) {
    return null
  }
}

/**
 * Display League Team Name
 * Returns league info if valid, otherwise null
 */
const displayLeagueName = async (seasonId, leagueId) => {
  try {
    const espnClient = new Client({ leagueId });
    const league = await espnClient.getLeagueInfo({ seasonId });
    console.log(league.leagueInfo.name)
  } catch (error) {
    return null
  }
}

/**
 * Display League Team Name
 * Returns league info if valid, otherwise null
 */
// const displayLeagueScores = async (seasonId, leagueId) => {
//   try {
//     const espnClient = new Client({ leagueId });
//     const league = await espnClient.getLeagueInfo({ seasonId });
//     console.log(league.leagueInfo.name);
//   } catch (error) {
//     return null
//   }
// }

/**
 * Custom espn object sort
 */
// const sort = (key) => {
// 	if (key === 'owners') {
// 		return (a, b) => (a[key][0] > b[key][0] ? 1 : -1);
// 	} else if (key === 'id') {
// 		return (a, b) => (a.id > b.id ? 1 : -1);
// 	} else if (key === 'date') {
// 		return (a, b) => (a.date < b.date ? 1 : -1);
//   }
  
//   return 1
// };

module.exports = {
  verifyLeague
  // displayLeagueName,
  // sort
}