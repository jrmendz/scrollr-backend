const express = require('express');

const router = express.Router();
const authController = require('./controllers/authController');
const espnController = require('./controllers/espnController');

/**
 * Verify leagueId
 */
router.post("/:seasonId/login", authController.login);

/**
 * Get teams with players data
 */
// router.get("/:seasonId/teams", espnController.getTeams);

 /**
  * Get players data
 */
// router.get("/:seasonId/players", espnController.getPlayers);

/**
  * Get weeks
  */
// router.get("/:seasonId/weeks", espnController.getWeeks);


/**
 * Get matchup
 */
// router.get("/:seasonId/matchup", espnController.getMatchup);


module.exports = router;
