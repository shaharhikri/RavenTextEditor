class Document {
    constructor(docName, userId, content) {
        this.docName = docName;
        this.userId = userId;
        this.content = content;
    }
}

module.exports = { Document };