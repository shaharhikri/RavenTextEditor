const dotenv = require('dotenv');
dotenv.config();
const port = process.env.PORT;
const express = require('express');
const app = express();

const router = require('./src/routes/text-editor-router');
app.use('/text-editor', router);

// Serve static files from /src/static
app.use('/static', express.static('src/static'));

const server = app.listen(port, function () {
    console.log(`Listening on port ${server.address().port}`);
});
