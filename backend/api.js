require('dotenv').config();
const express = require('express');
const axios = require('axios');
const router = express.Router();
const { Client, leagueId } = require("espn-fantasy-football-api/node-dev");

const myClient = new Client({ leagueId: process.env.LEAGUEID });
myClient.setCookies({
  espnS2: process.env.ESPNS2,
  SWID: process.env.SWID
});

const moment = require('moment');
moment.locale('en', {
	week: {
		dow: 1 // First day of week is Monday
	}
}); 

// Endpoint notes found on blogs
// http://fantasy.espn.com/apis/v3/games/ffl/seasons/
// http://fantasy.espn.com/apis/v3/games/ffl
// file:apis/v3/games/ffl/seasons/2020/segments/0/leagues
// http://fantasy.espn.com/apis/v3/games/ffl/seasons/2020/segments/0/leagues/39984366?view=mDraftDetail&view=mLiveScoring&view=mMatchupScore&view=mPendingTransactions&view=mPositionalRatings&view=mSettings&view=mTeam&view=modular&view=mNav

//  Players API
// http://fantasy.espn.com/apis/v3/games/ffl/seasons/2020/players?scoringPeriodId=0&view=players_wl

// TeamSchedules
// http://fantasy.espn.com/apis/v3/games/ffl/seasons/2020?view=proTeamSchedules
// const url = `http://fantasy.espn.com/apis/v3/games/ffl/seasons/2020/segments/0/leagues/${leagueId}`;

// Handle dynamic seasonId base from the route?
const url = `${process.env.ESPN_API_URL}/2020/segments/0/${leagueId}`;

const cookie = `SWID=${process.env.SWID};espn_s2=${process.env.ESPN_S2}`;

router.get('/', async function(req, res, next) {
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

	const teamsArray = league.data.teams;
	const membersArray = league.data.members;
	const rostersArray = roster.data.teams;
	sort(teamsArray, 'owners');

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

	sort(teamObjArray, 'id');

	rostersArray.forEach((team, teamIdx) => {
		team.roster.entries.forEach((player, playerIdx) => {
			const stats = player.playerPoolEntry.player.stats.filter(stat => stat.id === '002020' || stat.id === '102020' || stat.id === '002019');
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

  res.json(teamObjArray);
});


router.get('/test', async (req, res) => {
	const [fetch_players, fetch_teams] = await Promise.all([
		axios.get(`${url}?view=players_wl`, {
			headers: {
				Cookie: cookie
			}
		}),
		axios.get(`${url}?view=mTeam`, {
			headers: {
				Cookie: cookie
			}
		})
	]);

	const nflPlayers = fetch_players.data.players.map(players => ({
		id: players.player.id,
		name: players.player.fullName
	}));

	const teamsObj = fetch_teams.data.teams.map(team => ({
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
	}));

	// this for players being dropped // free agents ganern k :D
	let activityArray = [];

	const response = await axios.get(`${url}?view=kona_league_communication`, {
		headers: {
			Cookie: cookie
		}
	});

	response.data.communication.topics
		.filter(msg => msg.type === 'ACTIVITY_TRANSACTIONS')
		.forEach(activity => {
			activity.messages.forEach(msg => {
				if (msg.messageTypeId === 180 || msg.messageTypeId === 178) {
					activityArray.push({
						activity: 'added',
						date: msg.date.toString(),
						player: nflPlayers.find(player => player.id === msg.targetId).name,
						team: teamsObj.find(team => team.id === msg.to).teamName
					});
				}
				if (msg.messageTypeId === 179 || msg.messageTypeId === 181) {
					activityArray.push({
						activity: 'dropped',
						date: msg.date.toString(),
						player: nflPlayers.find(player => player.id === msg.targetId).name,
						team: teamsObj.find(team => team.id === msg.to).teamName
					});
				}
				if (msg.messageTypeId === 239) {
					activityArray.push({
						activity: 'dropped',
						date: msg.date.toString(),
						player: nflPlayers.find(player => player.id === msg.targetId).name,
						team: teamsObj.find(team => team.id === msg.for).teamName
					});
				}
			});
		});

	sort(activityArray, 'date');
	res.json(activityArray);
});


router.get('/weeks', async (req, res) => {
	const [league, roster, schedule] = await Promise.all([
		axios.get(`${url}?view=mTeam`, {
			headers: {
				Cookie: cookie
			}
		}),
		axios.get(`${url}?view=mRoster`, {
			headers: {
				Cookie: cookie
			}
		}),

		// axios.get('http://fantasy.espn.com/apis/v3/games/ffl/seasons/2020?view=proTeamSchedules', {
		axios.get('${process.env.ESPN_API_URL}/2020?view=proTeamSchedules', {
			headers: {
				Cookie: cookie
			}
		})
	]);

	const teamRosters = roster.data.teams.map(team => ({
		id: team.id,
		roster: team.roster.entries.map(entry => ({
			playerId: entry.playerId,
			playerName: entry.playerPoolEntry.player.fullName,
			proTeamId: entry.playerPoolEntry.player.proTeamId,
			schedule: Object.keys(
				schedule.data.settings.proTeams.find(team => team.id === entry.playerPoolEntry.player.proTeamId).proGamesByScoringPeriod
			)
		}))
	}));

	const matchup = ['matchup periods'];
	let week = 1;
	let day = moment(1571797800000)
		.startOf('week')
		.valueOf();
	for (let i = 1; i <= 120; i++) {
		// initialize week at i
		matchup[week] = {};

		if (i % 6 === 0 && i !== 102) {
			matchup[week].value = week;
			matchup[week].text = `Week ${week}`;
			matchup[week].start = moment(day)
				.startOf('week')
				.format('dddd, MMMM Do YYYY, h:mm a');
			matchup[week].end = moment(day)
				.endOf('week')
				.format('dddd, MMMM Do YYYY, h:mm a');

			day = day + 7 * 86400000 + 4000000;
			week++;
		}
		if (i === 102) {
			matchup[week].value = week;
			matchup[week].text = `Week ${week}`;
			matchup[week].start = moment(day)
				.startOf('week')
				.format('dddd, MMMM Do YYYY, h:mm a');
			day = day + 7 * 86400000 + 4000000;
			matchup[week].end = moment(day)
				.endOf('week')
				.format('dddd, MMMM Do YYYY, h:mm a');
			day = day + 7 * 86400000 + 4000000;
			week++;
		}
	}
	matchup.shift();
	res.json(matchup);
});

router.get('/matchup', async (req, res) => {
	const [matchup, team] = await Promise.all([
		axios.get(`${url}?view=mMatchupScore`, {
			headers: {
				Cookie: cookie
			}
		}),
		axios.get(`${url}?view=mTeam`, {
			headers: {
				Cookie: cookie
			}
		})
	]);

	const teamObj = team.data.teams.map(team => {
		return {
			id: team.id,
			tag: team.abbrev,
			logo: team.logo,
			name: `${team.location} ${team.nickname}`.trim()
		};
	});

	const currentWeek = matchup.data.status.currentMatchupPeriod;
	console.log('currentWeek', currentWeek);

	const matchupWeek = matchup.data.schedule.filter(matchup => matchup.matchupPeriodId === currentWeek);

	const matchupObj = matchupWeek.map(matchup => {
		// console.log(matchup);
		if (matchup.away && matchup.home) {
			return {
				homeTeam: {
					teamId: matchup.home.teamId,
					tag: teamObj.find(team => team.id === matchup.home.teamId).tag,
					name: teamObj.find(team => team.id === matchup.home.teamId).name,
					logo: teamObj.find(team => team.id === matchup.home.teamId).logo,
					totalPointsLive: matchup.home.totalPointsLive
				},
				awayTeam: {
					teamId: matchup.away.teamId,
					tag: teamObj.find(team => team.id === matchup.away.teamId).tag,
					name: teamObj.find(team => team.id === matchup.away.teamId).name,
					logo: teamObj.find(team => team.id === matchup.away.teamId).logo,
					totalPointsLive: matchup.away.totalPointsLive
				},
				winner: matchup.winner
			};
		} else {
			return {
				awayTeam: 'bye',
				homeTeam: {
					teamId: matchup.home.teamId,
					tag: teamObj.find(team => team.id === matchup.home.teamId).tag,
					name: teamObj.find(team => team.id === matchup.home.teamId).name,
					logo: teamObj.find(team => team.id === matchup.home.teamId).logo,
					totalPointsLive: matchup.home.totalPointsLive
				}
			};
		}
	});
	res.json({ matchupObj, currentWeek });
});

module.exports = router;