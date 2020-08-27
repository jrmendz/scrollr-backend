var request = require('request');
var options = {
    'method': 'GET',
    'url': 'https://fantasy.espn.com/apis/v3/games/ffl/seasons/2020/segments/0/leagues/39984366?rosterForTeamId=1&view=mDraftDetail&view=mLiveScoring&view=mMatchupScore&view=mPendingTransactions&view=mPositionalRatings&view=mRoster&view=mSettings&view=mTeam&view=modular&view=mNav',
    'headers': {
        'Accept': 'application/json',
        'X-Fantasy-Source': 'kona',
        'X-Fantasy-Filter': '{"players":{}}',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36',
        'X-Fantasy-Platform': 'kona-PROD-823992cb7ffb6f23ba1f8366157393bd759491d9',
        'Cookie': 'region=unknown; _dcf=1'
    }
};

request(options, function (error, response) {
    if (error) throw new Error(error);
    console.log(JSON.stringify(JSON.parse(response.body), null, 2));
});