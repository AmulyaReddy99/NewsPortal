const request = require('request');
const {Client} = require('camunda-external-task-client-js');
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const Articles = require('./models/Articles');
const articles = require('./models/Articles');

var camundaEngineUrl = 'http://localhost:8081/rest/'; // default if not overwritten by ENV variable
var targetPort = '8090'; //default if not overwritten by ENV
if (process.env.CAMUNDA_URL) {
  camundaEngineUrl = process.env.CAMUNDA_URL;
}
// We could also use User-Provided Service Instances (cf cups), see https://docs.cloudfoundry.org/devguide/services/user-provided.html and https://docs.run.pivotal.io/buildpacks/node/node-service-bindings.html
// var cfenv = require("cfenv");
// var vcap_services = JSON.parse(process.env.VCAP_SERVICES);
// var uri = vcap_services.camunda[0].credendtials.uri;

if (process.env.TARGET_PORT) {
  targetPort = process.env.TARGET_PORT;
}
console.log('Use Camunda Server at ' + camundaEngineUrl);


// setup external task client
var client = new Client( { baseUrl: camundaEngineUrl, interval: 50, asyncResponseTimeout: 10000});
// External Task subscription to do business logic
client.subscribe('sysout', async function({ task, taskService }) {
  console.log('Hello World: %s', task.variables.get('someText'));
  await taskService.complete(task);
});


// Deployment of Workflow Definition during startup (duplicates are NOT deployed)
function deployProcess() {
    filename = 'news_review.bpmn';
    filepath = path.join(__dirname, filename);
    console.log(filepath);

    request(
        {
          method: "POST", // see https://docs.camunda.org/manual/latest/reference/rest/deployment/post-deployment/
          uri: camundaEngineUrl + 'engine/default/deployment/create',
          headers: {
              "Content-Type": "multipart/form-data"
          },
          formData : {
              'deployment-name': 'news_review',
              'enable-duplicate-filtering': 'true',
              'deploy-changed-only': 'true',
              'scripttest.bpmn': {
                'value':  fs.createReadStream(filepath),
                'options': {'filename': filename}
              }
          }
        }, function (err, res, body) {
            if (err) {
              console.log(err);
              throw err;
            }
            console.log('[%s] Deployment succeeded: ' + body);
    
    });
}

// Start workflow instance: https://docs.camunda.org/manual/latest/reference/rest/process-definition/post-start-process-instance/
function startProcess(article) {
  request(
    {
      method: "POST", // see https://docs.camunda.org/manual/latest/reference/rest/deployment/post-deployment/
      uri: camundaEngineUrl + 'engine/default/process-definition/key/'+'NewsReviewFlow'+'/start',
      json: {
        "variables": {
          "users": {
          "value": "editor1,editor2,editor3",
            "type": "String"
          },
          "noOfUsers": {
            "value": 3,
            "type": "Integer"
          },
          "userIndex": {
            "value": 0,
            "type": "Integer"
          },
          "article": {
            "value": article,
            "type": "String"
          } 
      }
    }
  }, function (err, res, body) {
      if (err) {
        console.log(err);
        throw err;
      }
      console.log(body);
      processInstanceId = body.id
      return body;
  });
}

function getActiveTask(editor, processInstanceId, approved){
  request(
    {
      method: "GET", // see https://docs.camunda.org/manual/latest/reference/rest/deployment/post-deployment/
      uri: camundaEngineUrl + 'engine/default/task?active=true&assignee='+editor+'&processInstanceId='+processInstanceId,
    }, function (err, res, body) {
        if (err) {
          console.log(err);
          throw err;
        }
        taskId = JSON.parse(body)[0].id
        complete(taskId, approved);  
      });
}

function complete(taskId, approved) {
  request(
    {
      method: "POST", // see https://docs.camunda.org/manual/latest/reference/rest/deployment/post-deployment/
      uri: camundaEngineUrl + 'engine/default/task/'+taskId+'/complete',
      json: {
        "variables": {
            "reviewStatus" : {
                "value" : approved,
                "type": "String"
            }
          }
      }
    }, function (err, res, body) {
        if (err) {
          console.log(err);
          throw err;
        }
        console.log(body);
  });
}

// Auto-Deploy on startup
deployProcess();


// Webserver to provide REST API to start workflow instances
var app = express();
app.use(cors())
app.use(express.json());

app.post('/article', function (req, res) {
  request(
    {
      method: "POST", // see https://docs.camunda.org/manual/latest/reference/rest/deployment/post-deployment/
      uri: camundaEngineUrl + 'engine/default/process-definition/key/'+'NewsReviewFlow'+'/start',
      json: {
        "variables": {
          "users": {
          "value": "editor1,editor2,editor3",
            "type": "String"
          },
          "noOfUsers": {
            "value": 3,
            "type": "Integer"
          },
          "userIndex": {
            "value": 0,
            "type": "Integer"
          },
          "article": {
            "value": req.body.article,
            "type": "String"
          } 
      }
    }
  }, function (err, response, body) {
      if (err) {
        console.log(err);
        throw err;
      }
      console.log(body);
      processInstanceId = body.id
      res.send(body);
  });
})

app.post('/complete', function (req, res) {
  console.log(req.body.processInstanceId)
  request(
    {
      method: "GET", // see https://docs.camunda.org/manual/latest/reference/rest/deployment/post-deployment/
      uri: camundaEngineUrl + 'engine/default/task?active=true&assignee='+req.body.editor,
    }, function (err, res, body) {
        if (err) {
          console.log(err);
          throw err;
        }
        console.log("ACTIVE TASK")
        console.log(body);
        taskId = JSON.parse(body)[0].id
        console.log("TASKID",taskId)
        complete(taskId, req.body.approved);  
      });
})

app.post('/article/add', function(req, res) {
  console.log(req.body.article)
  article_ex = new Articles(req.body.article)
  console.log(article_ex)
  article_ex.save((err)=>{
    if(err) console.log(err)
  })
})

app.post('/article/update', function(req, res) {
  console.log(req.body.id, req.body.articleText)
  Articles.findOneAndUpdate({ _id: req.body.id }, { $set: { articleText: req.body.articleText } }, function(e,r,b){
    res.send(b)
  })
})

app.post('/articles', function(req, res){
  let processInstanceMap = {}
  request(
  {
    method: "GET", // see https://docs.camunda.org/manual/latest/reference/rest/deployment/post-deployment/
    uri: camundaEngineUrl + 'engine/default/task?active=true&assignee='+req.body.editor,
  }, function (err, response, body) {
      if (err) {
        console.log(err);
        throw err;
      }
      for (b of JSON.parse(body)){
        processInstanceMap.processInstanceId = b.processInstanceId
      }
      console.log(processInstanceMap)
      if (Object.keys(processInstanceMap).length != 0) {
        Articles.find(processInstanceMap, function(err, result){
          res.send(result)
        })
      } else {
        res.send([])
      }
    }
  )
})

var server = app.listen(targetPort, function () {
  var host = server.address().address
  var port = server.address().port
  console.log('REST API now listening at http://%s:%s', host, port)
})