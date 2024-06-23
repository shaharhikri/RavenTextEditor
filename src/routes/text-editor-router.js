const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser')
router.use(bodyParser.json())
const path = require('path');
const RavenDB = require('ravendb');

const dbName = process.env.RAVENDB_DBNAME;
const ravenUrl = process.env.RAVENDB_URL;
const idSeparator = process.env.RAVEN_ID_SEPARATOR;
const docsPrefix = process.env.RAVEN_DOCS_COLLECTION_NAME+"/";

let store = require(path.join(__dirname, '../db-utils/document-store'));
const { Document } = require('../db-utils/model-classes');

router.get('/', (req, res) => {
  // res.sendFile(__dirname + '/src/static/views/text-editor.html');
  res.sendFile(path.join(__dirname, '../static/views/text-editor.html'));
});
  

router.post('/save-document', async (req, res) => {
    var userId = req.body.userId;
    var docName = req.body.docName;
    var content = req.body.content;

    var docId = generateDocId(userId, docName);

    let doc = new Document(docName, userId, content);
    await saveDoc(doc, docId);
});

router.post('/get-document', async (req, res) => {
  var userId = req.body.userId;
  var docName = req.body.docName;

  var docs = await findDocByDocNameAndUserId(docName, userId);
  if(docs.length < 1){
    res.status(404).json({ error : 'There\'s no such doc' });
    return;
  }

  var doc = docs[0].content;
  res.json(doc);
});

router.post('/get-files', async (req, res) => {
  var userId = req.body.userId;
  var docs = await findDocsByUserId(userId);
  res.json({ docs: docs });
});



async function findDocById(id){
  let session = store.openSession();
  return await session.session.load(id); 
}

async function saveDoc(doc, id){
  let session = store.openSession();
  session.store(doc, id);
  await session.saveChanges();
}

function generateDocId(userId, docName){
  return docsPrefix+userId+idSeparator+docName;
}

async function findDocsByUserId(userId){
  let session = store.openSession();
  return await session.advanced
      .rawQuery("from Documents where userId = '"+userId+"' select docName")
      .all();
}

async function findDocByDocNameAndUserId(docName, userId){
  let session = store.openSession();
  return await session.advanced
      .rawQuery("from Documents where userId = '"+userId+"' and docName = \""+docName+"\" select content")
      .all();
}

module.exports = router;