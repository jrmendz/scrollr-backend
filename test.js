const { Client, Team, BoxScore} = require('espn-fantasy-football-api/node-dev');
const axios = require('axios');
const espnS2 = 'AEBNqHVhRAc2FgKmOJpzNAUmiRVE8IU0Lt3d9Prrx6izrE39auHhyfZ45iGEb%2FNudx8O7I2%2BPGxA2O%2BVA5DOI9sJEsCurPw2gSWLgmsOVWVNhlKj2TaSAttl6tQw%2B680V7V4cITNblBp%2FbbpYs88MNB41eMBfvVNeg%2BFKxuo4dhhkNzmiMgcTisY6bRWBCQjZSWfNopFBM378QC%2FzmK5MEM3%2Ffjs9HYV5NUDngJH0DTVUUxDoQG7M4ByoUD%2FoxbQLsw6RhlsC8SiKkJ%2BO456iiGm'
const SWID = '{9C5FB733-65CF-4FA2-8106-AD5CF157F4F6}'
const seasonId = 2020;
// const leagueId =  759573;
const leagueId =  72438126;
const current_week = 1;
const myClient = new Client({ leagueId: leagueId });

myClient.setCookies({ espnS2: espnS2, SWID: SWID });

main();
getBoxScoresForWeek(current_week);

function getSortedScoresByWeek(schedule) {
    const playedGames = schedule.filter((matchup) => {
        return matchup.winner != 'UNDECIDED';
    }).map((matchup) => {
        return {
            "matchupPeriodId": matchup.matchupPeriodId,
            "scores":[{"teamId": matchup.home.teamId, "score":matchup.home.totalPoints},
                      {"teamId": matchup.away.teamId, "score":matchup.away.totalPoints}]
        };
    }).reduce((acc, matchup) => {
        if (matchup.matchupPeriodId in acc) {
            acc[matchup.matchupPeriodId] = acc[matchup.matchupPeriodId].concat(...matchup.scores)
        }
        else {
            acc[matchup.matchupPeriodId] = matchup.scores;
        }
        return acc;
    },{});
    
    // sort each week's scores descending
    Object.keys(playedGames).forEach( (week) => {
        playedGames[week] = playedGames[week].sort((a,b) => a.score < b.score ? 1 : -1);
    });
    // console.log(playedGames);
    return playedGames;
}

async function getLeagueData() {
    const routeBase = `http://fantasy.espn.com/apis/v3/games/ffl/seasons/${seasonId}/segments/0/leagues/${leagueId}/`;
    const routeParams = "?view=mTeam&view=mMatchupScore&view=modular";
    const route = "".concat(routeBase, routeParams);
    try {
        const response  = await axios.get(route, { 
            headers: {
                Cookie: `espn_s2=${espnS2}; SWID=${SWID};`
            }
        });
        // console.log(response.headers);
        return response.data;
    } catch (error) {
        // console.log(error.response.data);
        return "error";
    }
}

async function main() {
    class simTeam {
        constructor(id, name, abbreviation) {
            this.id = id;
            this.name = name;
            this.abbreviation = abbreviation;
            this.totalPoints = 0;
            this.wins = 0;
            this.ties = 0;
            this.losses = 0;
            this.weeklyRecord = {} 
        }
    }
    const leagueData = await getLeagueData();
    let simulatedTeams = {};
    leagueData.teams.forEach( (team) => {
        team.cache;
        let tempTeam = new simTeam(team.id, team.location.concat(" " + team.nickname), team.abbrev);
        simulatedTeams[team.id] = tempTeam;
        simulatedTeams[team.id].totalPoints = team.points.toFixed(2);
    });
    const playedGames = getSortedScoresByWeek(leagueData.schedule);
    Object.keys(playedGames).forEach( (week) => {
        const weekScores = playedGames[week];
        for (let i=0;i<weekScores.length;i++) {
            const team = weekScores[i];
            let fOffset = 1;
            let bOffset = 1;
            while (i + fOffset < weekScores.length && weekScores[i + fOffset].score == weekScores[i].score) {
                fOffset++;
            }
            while (i - bOffset >= 0 && weekScores[i - bOffset].score == weekScores[i].score) {
                bOffset++;
            }
            const simulatedWeek = { 
                "wins": weekScores.length - i - 1 - (fOffset - 1),
                "losses": i - (bOffset - 1),
                "ties": (fOffset - 1) + (bOffset - 1)
            };
            simulatedTeams[team.teamId].weeklyRecord[week] = simulatedWeek;
            simulatedTeams[team.teamId].wins += simulatedWeek.wins;
            simulatedTeams[team.teamId].losses += simulatedWeek.losses;
            simulatedTeams[team.teamId].ties += simulatedWeek.ties;
        }
    });
    
    let sortedTeams = Object.keys(simulatedTeams).map( (id) => {
        return simulatedTeams[id];
    }).sort((a,b) => a.wins < b.wins ? 1 : -1)
    .forEach( (team) => {
        let output = `${team.name}: ${team.wins}-${team.losses}`;
        if (team.ties > 0) {
            output = output.concat(`-${team.ties}`);
        }
        console.log(output);
    });
    }

async function getBoxScoresForWeek(week) {
        const leagueData = await getLeagueData();
        const teamData = leagueData.teams.reduce( (acc,team) => {
            acc[team.id] = {"name": team.location.concat(" "+team.nickname), "abbrev":team.abbrev};
            return acc;
        }, {});
        const boxscores = await myClient.getBoxscoreForWeek({ seasonId: seasonId, scoringPeriodId: week, matchupPeriodId: week });
        console.log(`=================== Week ${week} Scores ===================`);
        boxscores.forEach( (boxscore) => {
            const homeOptimalRoster = maxTeamScore(boxscore.homeRoster);
            const awayOptimalRoster = maxTeamScore(boxscore.awayRoster);

            console.log(`==================== ${teamData[boxscore.homeTeamId].abbrev}  vs. ${teamData[boxscore.awayTeamId].abbrev} =====`);
            // console.log("Actual Score:        " + boxscore.homeScore + ' - ' + boxscore.awayScore);
            // console.log("Max Possible Scores: " + sumStarters(homeOptimalRoster) + ' - ' + sumStarters(awayOptimalRoster));
            const homeRoundRoster = roundStarters(boxscore.homeRoster);
            const awayRoundRoster = roundStarters(boxscore.awayRoster);
            console.log(`2020 Score:          ${sumRoster(homeRoundRoster)} - ${sumRoster(awayRoundRoster)}`);
        });
}

async function getCachedTeams(boxscore, callback) {
    const homeTeam = await Team.get(`id=${boxscore.homeTeamId};leagueId=${leagueId};seasonId=${seasonId};`);
    const awayTeam = await Team.get(`id=${boxscore.awayTeamId};leagueId=${leagueId};seasonId=${seasonId};`);
    callback(homeTeam, awayTeam, boxscore);
}

function printScores(homeTeam, awayTeam, boxscore) {
    let oldHomeScore = roundStarters(boxscore.homeRoster);
    let oldAwayScore = roundStarters(boxscore.awayRoster);
    if (checkForResultVariant(oldHomeScore, oldAwayScore, boxscore)) {
        const result = getMatchupResult(oldHomeScore, oldAwayScore);
        console.log(`${result == 1 ? 'Home Win' : (result == -1 ? 'Away win' : 'TIE AHAHAHAH')} 2020 Score: ${homeTeam.abbreviation}: ${oldHomeScore}--${oldAwayScore} :${awayTeam.abbreviation}`);
    }
    console.log(`2020 Score: ${homeTeam.abbreviation}: ${oldHomeScore}--${oldAwayScore} :${awayTeam.abbreviation}`);
}
// takes in array of BoxscorePlayers
// returns summation of each player's rounded score (according to 2020 scoring rules)
function roundStarters(roster) {
    let roundedTotal = 0;
    let roundedRoster = [];
    roster.forEach( (player) => {
        if (player.position != 'Bench') {
            const roundScore = roundPlayerScore(player)
            roundedTotal += roundScore;
            roundedRoster.push({"player":player.player.firstName + " " + player.player.lastName, "roundedScore":roundScore});
        }
    });
    return roundedRoster
}

function sumRoster(roundRoster) {
    let sum = roundRoster.reduce( (acc,player) => {
        acc += player.roundedScore;
        return acc;
    }, 0);
    return sum;
}

// takes in BoxscorePlayer
function roundPlayerScore(player) {
    const baseScore = player.totalPoints;
    const ptBreakdown = player.pointBreakdown;
    let roundedBreakdown = 0;
    let summedBreakdown = 0;
    for (let prop in ptBreakdown) {
        let val = ptBreakdown[prop];
        if (typeof val == 'number') {
            roundedBreakdown += Math.floor(val);
            summedBreakdown += val;
        }
    }
    roundedScore = Math.floor(baseScore - summedBreakdown) + roundedBreakdown;
    return roundedScore;
}

function sumStarters(roster) {
    let sum = 0;
    for (i in roster) {
        const position = roster[i];
        position.forEach( (player) => sum += player.totalPoints);
    }
    return sum.toFixed(1);
}

function sortRosterByScore(roster) {
    let sorted = [];
    roster.forEach( (slot) => {
        let rosterPlayer = {
            'name': slot.player.fullName, 
            'pos': slot.player.defaultPosition,
            'totalPoints': slot.totalPoints
        }
        sorted.push(rosterPlayer);
    });
    return sorted.sort((a,b) => a.totalPoints < b.totalPoints ? 1 : -1);
}

function maxTeamScore(roster) {

    let maxRoster = {
        'TQB': [],   
        'RB': [],    
        'RB/WR': [],  
        'WR': [],    
        'FLEX': [],  
        'WR/TE': [],    
        'D/ST': []   
    };
    let activeRosterSize = 0;
    let rosterByScore = sortRosterByScore(roster);
    for (i in rosterByScore) {
        let player = rosterByScore[i];
      
        if (activeRosterSize == 9) break;
    
        if ((player.pos == 'RB/WR' || player.pos == 'RB') && maxRoster[player.pos].length < 2) { // max limit === 2
            maxRoster[player.pos].push(player);
            activeRosterSize++;
        }

        else if (maxRoster[player.pos].length < 1) {
            maxRoster[player.pos].push(player);
            activeRosterSize++;
        }

        else if ((player.pos == 'RB/WR' || player.pos == 'RB' || player.pos == 'WR') && maxRoster.FLEX.length < 1) {
            maxRoster.FLEX.push(player);
            activeRosterSize++;
        }
    }
    return maxRoster;
}