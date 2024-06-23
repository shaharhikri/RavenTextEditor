const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const RavenDB = require('ravendb');
const app = express();

const port = process.env.PORT;
const dbName = process.env.RAVENDB_DBNAME;
const ravenUrl = process.env.RAVENDB_URL;

const bodyParser = require('body-parser')
//router.use(bodyParser.json())
app.use(bodyParser.json())

// Serve static files from /src/static
app.use('/static', express.static('src/static'));

// Create a new RavenDB document store
const store = new RavenDB.DocumentStore(ravenUrl,dbName);

const server = app.listen(port, function () {
    console.log(`Listening on port ${server.address().port}`);
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/src/static/views/text-editor.html');
  });
  
// Handle document saves
app.post('/save-document', (req, res) => {
    var content = req.body.content;
    let doc = { content: content}
    store.openSession().then(session => {
      session.store(doc, 'ycollection');
      return session.saveChanges();
    }).then(() => {
      res.send('Document saved successfully!');
    }).catch(err => {
      res.status(500).send('Error saving document: ' + err);
    });
});