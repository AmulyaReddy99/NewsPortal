const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const articles = require('./routes/articles');
const userAuth = require('./routes/userManagement');
const Constants = require('./Constants');
const methodOverride = require("method-override");

// var server = ldap.createServer();

userAuth.authenticateDN('uid=admin,ou=system', 'secret');

// Webserver to provide REST API to start workflow instances
var app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(methodOverride('method-override'));

app.post('/user', function (req,res) {
  res.json(req.body)
})

app.use('/', articles);
app.use('/users', userAuth.router);

var server = app.listen(Constants.TARGET_PORT, function () {
  var host = server.address().address
  var port = server.address().port
  console.log('REST API now listening at http://%s:%s', host, port)
})