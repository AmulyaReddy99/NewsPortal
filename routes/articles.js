var express = require('express');
var router = express.Router();
const request = require('request');
const Articles = require('../models/Articles');
const Constants = require('../Constants');
const path = require('path');
const {Client} = require('camunda-external-task-client-js');
const fs = require('fs');

var camundaEngineUrl = Constants.CAMUNDA_URL; // default if not overwritten by ENV variable
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
    filename = Constants.BPMN_NAME;
    filepath = path.join(Constants.BPMN_PATH, filename);
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

// Auto-Deploy on startup
// deployProcess();

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

router.post('/complete', function (req, res) {
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
  
  router.post('/article/add', function(req, res) {
    console.log(req.body.article)
    article_ex = new Articles(req.body.article)
    console.log(article_ex)
    article_ex.save((err)=>{
      if(err) console.log(err)
    })
  })
  
  router.post('/article/update', function(req, res) {
    console.log(req.body.id, req.body.articleText)
    Articles.findOneAndUpdate({ _id: req.body.id }, { $set: { articleText: req.body.articleText } }, function(e,r,b){
      res.send(b)
    })
  })
  
  router.post('/articles', function(req, res){
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
  

router.post('/article', function (req, res) {
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

const util = require("util");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const mongoose = require('mongoose');

const mongoURI = 'mongodb://localhost:27017/files_db';
const conn = mongoose.createConnection(mongoURI, {useNewUrlParser: true, useUnifiedTopology: true});
let gfs;
conn.once('open', () => {
  // Init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('photos');
  console.log("connected gfs")
});

router.get('/getImage/:filename', function (req, res) {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    // Check if file
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists'
      });
    }
        // Check if image
        if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
          // Read output to browser
          const readstream = gfs.createReadStream(file.filename);
          readstream.pipe(res);
        } else {
          res.status(404).json({
            err: 'Not an image'
          });
        }
  });
})


var storage = new GridFsStorage({
  url: "mongodb://localhost:27017/files_db",
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    const match = ["image/png", "image/jpeg"];

    if (match.indexOf(file.mimetype) === -1) {
      const filename = `${Date.now()}-file-${file.originalname}`;
      return filename;
    }

    return {
      bucketName: "photos",
      filename: `${Date.now()}-file-${file.originalname}`
    };
  }
});

var uploadFile = multer({ storage: storage }).single("file");
var uploadFilesMiddleware = util.promisify(uploadFile);

const uploadFileFunc = async (req, res) => {
  try {
    await uploadFilesMiddleware(req, res);

    console.log(req.file);
    if (req.file == undefined) {
      return res.send(`You must select a file.`);
    }

    return res.send(`File has been uploaded.`);
  } catch (error) {
    console.log(error);
    return res.send(`Error when trying upload image: ${error}`);
  }
};

router.post('/addVideo', function (req, res) {

})

router.post('/addImage', function (req, res) {
  uploadFileFunc(req, res)
})

router.post('/addAudio', function (req, res) {
  
})

router.post('/getVideo', function (req, res) {

})

router.post('/getAudio', function (req, res) {
  
})

module.exports = router;