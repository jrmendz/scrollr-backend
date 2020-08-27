const joi = require('joi');
// const axios = require('axios');
const espnHelper = require('../helpers/espnHelper');

// const getTeam = async (req, res) => {
//   try {
//     const { body } = req;

//     const schema = joi.object({
//       leagueId: joi.number().required()
//     });

//     const { error } = schema.validate(body);

//     if (error && error.details) {
//       return res
//         .status(400)
//         .json({
//           message: 'Bad request!'
//         });
//     }

//     const leagueName = await espnHelper.displayLeagueName(req.params.seasonId, body.leagueId);

//     if (!league) {
//       return res
//         .status(400)
//         .json({
//           message: 'Invalid ESPN League ID!'
//         });
//     }

//     return res
//       .status(200)
//       .json({
//         message: 'Display Success!'
//       });
//   } catch (err) {
//     return res
//       .status(500)
//       .json({
//         message: 'Oops! Something went wrong!'
//       });
//   }
// }

// module.exports = {
//   getTeam
// }

const getTeams = async (req, res) => {
  try {
    const { body } = req;

    const schema = joi.object({
      leagueId: joi.number().required()
    });

    const { error } = schema.validate(body);

    if (error && error.details) {
      return res
        .status(400)
        .json({
          message: 'Bad request!'
        });
    }

    const url = `${process.env.ESPN_API_URL}/${req.params.seasonId}/segments/0/${req.body.leagueId}`;
    const cookie = `SWID=${process.env.SWID};espn_s2=${process.env.ESPN_S2}`;

    let teamObjArray = [];
    const [league, roster] = await Promise.all([
      axios.get(`${url}?view=mTeam`, {
        headers: {
          Cookie: cookie
        }
      }),
      axios.get(`${url}?view=mRoster`, {
        headers: {
          Cookie: cookie
        }
      })
    ]);
  
    const teamsArray = league.data.teams.sort(espnHelper.sort('owners'));
    const membersArray = league.data.members;
    const rostersArray = roster.data.teams;
  
    teamsArray.forEach(team =>
      teamObjArray.push({
        id: team.id,
        owner: team.owners[0],
        teamName: `${team.location} ${team.nickname}`.trim(),
        tag: team.abbrev,
        logo: team.logo,
        record: {
          wins: team.record.overall.wins,
          losses: team.record.overall.losses
        },
        waiver: team.waiverRank,
        roster: []
      })
    );
    membersArray.forEach((member, idx) => {
      teamObjArray[idx].name = `${member.firstName} ${member.lastName}`;
    });
  
    teamObjArray = teamObjArray.sort(espnHelper.sort('id'));
  
    rostersArray.forEach((team, teamIdx) => {
      team.roster.entries.forEach((player, playerIdx) => {
        const stats = player.playerPoolEntry.player.stats.filter(stat => stat.id === '002020' || stat.id === '102020' || stat.id === '002020');
        teamObjArray[teamIdx].roster.push({
          name: player.playerPoolEntry.player.fullName,
          playerId: player.playerPoolEntry.player.id,
          averageDraftPosition: player.playerPoolEntry.player.ownership.averageDraftPosition,
          yearTot: stats[0].appliedTotal,
          yearAvg: stats[0].appliedAverage,
          projTot: stats[1] ? stats[1].appliedTotal : 0,
          projAvg: stats[1] ? stats[1].appliedAverage : 0,
          lastYearTot: stats[2] ? stats[2].appliedTotal : 0,
          lastYearAvg: stats[2] ? stats[2].appliedAverage : 0
        });
      });
    });
  
    teamObjArray.forEach((team, teamidx) => {
      team.rosterDraftAvg =
        team.roster
          .map(player => player.averageDraftPosition)
          .reduce((acc, val) => {
            return acc + val;
          }) / team.roster.length;
    });
    
    return res
      .status(200)
      .json({
        body: teamObjArray
      });
  } catch (err) {
    return res
      .status(500)
      .json({
        message: 'Oops! Something went wrong!'
      });
  }
}

module.exports = {
  getTeams,
  // getPlayers,
  // getWeeks,
  // getMatchup
}