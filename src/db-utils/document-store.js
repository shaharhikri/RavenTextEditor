const { DocumentStore } = require('ravendb');

const dotenv = require('dotenv');
dotenv.config();


const url = process.env.RAVENDB_URL;
const dbname = process.env.RAVENDB_DBNAME;

const store = new DocumentStore(url, dbname);
store.initialize();
module.exports = store;