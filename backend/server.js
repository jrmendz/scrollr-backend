const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const axios = require("axios");


const cors = require('cors');
const routes = require('./routes');

// const { Client } = require("espn-fantasy-football-api/node-dev");
// const myClient = new Client({ leagueId: process.env.LEAGUEID });
// myClient.setCookies({
//   espnS2: process.env.ESPNS2,
//   SWID: process.env.SWID
// });

require('dotenv').config();

const app = express();
const apiRoutes = require("./api");


app.use(morgan('dev'));
app.use(bodyParser.json({limit: '200mb', extended: true}));
app.use(bodyParser.urlencoded({limit: '200mb', extended: true}));

app.use(cors({origin: "*"}))

app.use("/", routes);

const port = process.env.PORT || 8000;
app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`)
})