const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser')
router.use(bodyParser.json())
const path = require('path');
const RavenDB = require('ravendb');
const uuid = require('uuid');
const store = require(path.join(__dirname, '../db-utils/document-store'));

const docsPrefix = process.env.RAVEN_DOCS_COLLECTION_NAME + "/";
const { Document } = require('../db-utils/model-classes');

// serve the text editor HTML
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../static/views/text-editor.html'));
});

// save a document
router.post('/save-document', async (req, res) => {
  try {
    var docId = req.body.docId;
    var userId = req.body.userId; // TODO (multiple users): should get it from jwt middleware (for authorizeion)
    var docName = req.body.docName;
    var content = req.body.content;

    if (docId == undefined || docId == null)
      docId = generateDocId(); // new doc
    let doc = new Document(docName, userId, content);
    await saveDoc(doc, docId); // save new doc
    res.status(200).json({ docId: docId });
  } catch (error) {
    console.error('Error saving document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// get docs metadata for a specific user
router.post('/get-documents-metadata', async (req, res) => {
  try {
    var userId = req.body.userId; // TODO (multiple users): should get it from jwt middleware ,and change the http method to GET (for authorizeion)
    var docs = await findDocsByUserId(userId);
    res.json({ docs: docs });
  } catch (error) {
    console.error('Error getting documents metadata:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// get a document
router.get('/get-document', async (req, res) => {
  try {
    var docId = req.query.docId;
    if (!docId) {
      res.status(403).json({ error: 'Must send \'docId\' on url parameters' });
      return;
    }

    let session = store.openSession();
    var doc = await session.load(docId);
    if (doc == null) {
      res.status(404).json({ error: 'There\'s no such doc' });
      return;
    }

    // TODO (multiple users): should get userId from jwt middleware, and return status 401 if it has a different value then the doc.userId (for authorizeion)
    res.json(doc);
  } catch (error) {
    console.error('Error getting document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// get document revisions metadata
router.get('/get-revisions-metadata', async (req, res) => {
  try {
    var docId = req.query.docId;

    /* TODO (multiple users): should get userId from jwt middleware, load the doc, 
      and return status 401 if it has a different value then the doc.userId
      (for authorizeion).
    */

    var metadata = await getRevisions(docId);
    if (metadata == null)
      res.status(404).json({ error: 'There\'s no revisions for this doc ' + docName });

    var results = {
      revisionsMetadata: metadata
    }
    res.json(results);
  } catch (error) {
    console.error('Error getting revisions metadata:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// get a specific revision
router.get('/get-revision', async (req, res) => {
  try {
    var cv = req.query.cv;
    if (!cv) {
      res.status(403).json({ error: 'Must send \'cv\' on url parameters' });
      return;
    }

    var revision = await getRevision(cv);
    // TODO (multiple users): should get userId from jwt middleware, and return status 401 if it has a different value then the revision.userId (for authorizeion)

    var content = revision.content;
    if (content == null)
      res.status(404).json({ error: 'There\'s no revisions with the cv ' + cv });

    res.json(content);
  } catch (error) {
    console.error('Error getting revision:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



async function saveDoc(doc, id) {
  let session = store.openSession();
  await session.store(doc, id);
  await session.saveChanges();
}

function generateDocId() {
  return docsPrefix + uuid.v4();
}

async function getRevision(cv) {
  let session = store.openSession();
  var revision = await session.advanced.revisions.get(cv);

  return revision;
}

async function getRevisions(docId) {
  let session = store.openSession();
  var orderRevisionsMetadata = await session.advanced.revisions
    .getMetadataFor(docId, {
      start: 0,
      pageSize: 1000
    });

  return orderRevisionsMetadata.map((revisionMetadata) => {
    return {
      date: revisionMetadata[RavenDB.CONSTANTS.Documents.Metadata.LAST_MODIFIED],
      cv: revisionMetadata[RavenDB.CONSTANTS.Documents.Metadata.CHANGE_VECTOR]
    };
  });
}

async function findDocsByUserId(userId) {
  let session = store.openSession();
  return await session.advanced
    .rawQuery("from Documents where userId = '" + userId + "' select docName, id() as id")
    .all();
}


module.exports = router;