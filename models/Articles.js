const db = require('../config/mongoConfig')

const ArticlesSchema = new db.Schema({
    articleName: String,
    composer: String,
    approvedDate: String,
    approvedBy: String,
    lastUpdatedDate: String,
    articleText: String,
    processInstanceId: String
})

const articles = db.model('Articles',ArticlesSchema)

module.exports = articles;