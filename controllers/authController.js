const joi = require('joi');
const espnHelper = require('../helpers/espnHelper');
const espnApiHelper = require('../helpers/espnApiHelper');

const login = async (req, res) => {
  try {
    const { body } = req;
    const espnApi = new espnApiHelper({ seasonId: req.params.seasonId, leagueId: body.leagueId });

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

    const league = await espnApi.getModularData()

    if (!league) {
      return res
        .status(400)
        .json({
          message: 'Invalid ESPN League ID!'
        });
    }

    return res
      .status(200)
      .json({
        message: 'Login Success!',
        data: league
      });
  } catch (err) {
    return res
      .status(500)
      .json({
        message: 'Oops! Something went wrong!',
        err: err
      });
  }
}

module.exports = {
  login
}