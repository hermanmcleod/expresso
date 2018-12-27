const express = require('express');
const app = express();

module.exports = app;

const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');


const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const PORT = process.env.PORT || 4000;

app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use(cors());


const apiRouter = require('./api');
app.use('/api', apiRouter)

app.listen(PORT, function() {
	console.log(`Server is listening on port: ${PORT}`)
})