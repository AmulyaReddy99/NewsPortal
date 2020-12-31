require('dotenv').config()

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/articles', {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.connection.on('error',()=>console.log("error mongo"))
mongoose.connection.once('open',()=>console.log("connected mongo"))

module.exports = mongoose