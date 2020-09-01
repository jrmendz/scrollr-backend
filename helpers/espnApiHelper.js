const request = require('request');
const { Client } = require('espn-fantasy-football-api/node');
const espnS2 = 'AEBNqHVhRAc2FgKmOJpzNAUmiRVE8IU0Lt3d9Prrx6izrE39auHhyfZ45iGEb%2FNudx8O7I2%2BPGxA2O%2BVA5DOI9sJEsCurPw2gSWLgmsOVWVNhlKj2TaSAttl6tQw%2B680V7V4cITNblBp%2FbbpYs88MNB41eMBfvVNeg%2BFKxuo4dhhkNzmiMgcTisY6bRWBCQjZSWfNopFBM378QC%2FzmK5MEM3%2Ffjs9HYV5NUDngJH0DTVUUxDoQG7M4ByoUD%2FoxbQLsw6RhlsC8SiKkJ%2BO456iiGm';
const SWID = '{9C5FB733-65CF-4FA2-8106-AD5CF157F4F6}';
let modularData = {};

function espnApiHelper (params) {
    this.params = params;
    this.espnClient = new Client({ leagueId: params.leagueId, espnS2: espnS2, SWID: SWID });
}

espnApiHelper.prototype.getModularData = function getModularData() {
    const options = {
        method: 'GET',
        url: `http://fantasy.espn.com/apis/v3/games/ffl/seasons/${this.params.seasonId}/segments/0/leagues/${this.params.leagueId}`,
        headers: {
            Cookie: `SWID=${SWID};espn_s2=${espnS2}`
        },
        qs: {
            view: 'modular'
        }
    }

    return new Promise(function(resolve, reject){
        return request(options, function (error, { body }) {
            if (error) return reject(error);
            try {
                modularData = JSON.parse(body);
                resolve(JSON.parse(body));
            } catch(e) {
                reject(e);
            }
        });
    });
}

espnApiHelper.prototype.getFreeAgents = async function getFreeAgents(status) {
    let freeAgents = [];

    try {
        const players = await this.espnClient.getFreeAgents({ seasonId: modularData.seasonId, scoringPeriodId: modularData.scoringPeriodId });
        players.find(elements => {
            if (elements.player.availabilityStatus == status) {
                freeAgents.push(elements);
            }
        });
        console.log(freeAgents)

        return freeAgents;
    } catch (error) {
        console.log(error)
        return null
    }
}

espnApiHelper.prototype.getKonaPlayerInfo = function getKonaPlayerInfo() {
    const options = {
        method: 'GET',
        url: `http://fantasy.espn.com/apis/v3/games/ffl/seasons/${this.params.seasonId}/segments/0/leagues/${this.params.leagueId}`,
        headers: {
            Cookie: `SWID=${SWID};espn_s2=${espnS2}`
        },
        qs: {
            scoringPeriodId: modularData.scoringPeriodId,
            view: 'kona_player_info​'
        }
    }

    return new Promise(function(resolve, reject){
        return request(options, function (error, { body }) {
            if (error) return reject(error);
            try {
                resolve(JSON.parse(body));
            } catch(e) {
                reject(e);
            }
        });
    });
}

espnApiHelper.prototype.getTeams = function getTeams() {
    const options = {
        method: 'GET',
        url: `http://fantasy.espn.com/apis/v3/games/ffl/seasons/${this.params.seasonId}/segments/0/leagues/${this.params.leagueId}`,
        headers: {
            Cookie: `SWID=${SWID};espn_s2=${espnS2}`
        },
        qs: {
            scoringPeriodId: modularData.scoringPeriodId,
            view: 'mTeam'
        }
    }

    return new Promise(function(resolve, reject){
        return request(options, function (error, { body }) {
            if (error) return reject(error);
            try {
                resolve(JSON.parse(body));
            } catch(e) {
                reject(e);
            }
        });
    });
}

espnApiHelper.prototype.getRosters = function getRosters() {
    const options = {
        method: 'GET',
        url: `http://fantasy.espn.com/apis/v3/games/ffl/seasons/${this.params.seasonId}/segments/0/leagues/${this.params.leagueId}`,
        headers: {
            Cookie: `SWID=${SWID};espn_s2=${espnS2}`
        },
        qs: {
            scoringPeriodId: modularData.scoringPeriodId,
            view: 'mRoster'
        }
    }

    return new Promise(function(resolve, reject){
        return request(options, function (error, { body }) {
            if (error) return reject(error);
            try {
                resolve(JSON.parse(body));
            } catch(e) {
                reject(e);
            }
        });
    });
}


espnApiHelper.prototype.getBoxScore = function getBoxScore() {
    const options = {
        method: 'GET',
        url: `http://fantasy.espn.com/apis/v3/games/ffl/seasons/${this.params.seasonId}/segments/0/leagues/${this.params.leagueId}`,
        headers: {
            Cookie: `SWID=${SWID};espn_s2=${espnS2}`
        },
        qs: {
            scoringPeriodId: modularData.scoringPeriodId,
            view: 'mBoxscore'
        }
    }

    return new Promise(function(resolve, reject){
        return request(options, function (error, { body }) {
            if (error) return reject(error);
            try {
                resolve(JSON.parse(body));
            } catch(e) {
                reject(e);
            }
        });
    });
}


espnApiHelper.prototype.getPlayerWinLoss = function getPlayerWinLoss() {
    const options = {
        method: 'GET',
        url: `http://fantasy.espn.com/apis/v3/games/ffl/seasons/${this.params.seasonId}/segments/0/leagues/${this.params.leagueId}`,
        headers: {
            Cookie: `SWID=${SWID};espn_s2=${espnS2}`
        },
        qs: {
            scoringPeriodId: modularData.scoringPeriodId,
            view: 'player_wl'
        }
    }

    return new Promise(function(resolve, reject){
        return request(options, function (error, { body }) {
            if (error) return reject(error);
            try {
                resolve(JSON.parse(body));
            } catch(e) {
                reject(e);
            }
        });
    });
}


espnApiHelper.prototype.getSchedule = function getSchedule() {
    const options = {
        method: 'GET',
        url: `http://fantasy.espn.com/apis/v3/games/ffl/seasons/${this.params.seasonId}/segments/0/leagues/${this.params.leagueId}`,
        headers: {
            Cookie: `SWID=${SWID};espn_s2=${espnS2}`
        },
        qs: {
            scoringPeriodId: modularData.scoringPeriodId,
            view: 'mSchedule'
        }
    }

    return new Promise(function(resolve, reject){
        return request(options, function (error, { body }) {
            if (error) return reject(error);
            try {
                resolve(JSON.parse(body));
            } catch(e) {
                reject(e);
            }
        });
    });
}


espnApiHelper.prototype.getSettings = function getSettings() {
    const options = {
        method: 'GET',
        url: `http://fantasy.espn.com/apis/v3/games/ffl/seasons/${this.params.seasonId}/segments/0/leagues/${this.params.leagueId}`,
        headers: {
            Cookie: `SWID=${SWID};espn_s2=${espnS2}`
        },
        qs: {
            scoringPeriodId: modularData.scoringPeriodId,
            view: 'mSettings'
        }
    }

    return new Promise(function(resolve, reject){
        return request(options, function (error, { body }) {
            if (error) return reject(error);
            try {
                resolve(JSON.parse(body));
            } catch(e) {
                reject(e);
            }
        });
    });
}


module.exports = espnApiHelper;