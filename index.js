// Require express and body-parser
const express = require("express");
const bodyParser = require("body-parser");
const delve = require('dlv');
const axios = require('axios');
const FormData = require('form-data');

// Initialize express and define a port
const app = express();
// app.use(express.json());
const port = process.env.PORT || 8080;

// Tell express to use body-parser's JSON parsing
app.use(bodyParser.json());

// Start express on the defined port
app.listen(port, () => console.log(`Listening on ${port}...`));

app.get("/", (req, res) => {
  res.send(`"Above all, don't lie to yourself. The man who lies to himself and listens to his own lie comes to a point that he cannot distinguish the truth within him, or around him, and so loses all respect for himself and for others. And having no respect he ceases to love." ― Fyodor Dostoevsky, The Brothers Karamazov`);
});

app.post("/hook", (req, res) => {
  let payload = req.body;
  let header = req.headers;
  res.status(200).end()

  let pullRequestBranch = getPullRequestBranch(payload);
  let baseBranch = getBaseBranch(payload);
  let commitURL = getCommitURL(payload);
  let action = getAction(payload);
  let XGithubDelivery = getXGithubDelivery(header);
  let XGithubEvent = getXGithubEvent(header);
  let jenkinsTargetUrl = process.env.JENKINS_BASE_URL;
  let token = process.env.JENKINS_TOKEN;
  let basicAuth = process.env.JENKINS_BASIC_AUTH;
  let state = process.env.GITHUB_STATE;
  let message = process.env.MESSAGE;
  let accessToken = process.env.GITHUB_TOKEN;

  if ((action == "opened" && XGithubEvent == "pull_request") && (baseBranch == process.env.SUBJECT_BRANCH) && (pullRequestBranch || baseBranch || commitURL != undefined)) {
    updateCommitStatus(commitURL, state, jenkinsTargetUrl, message, accessToken);
    postToJenkins(payload, jenkinsTargetUrl, token, basicAuth, XGithubDelivery, baseBranch, process.env.SUBJECT_BRANCH);
  } else {
    console.log(`Request not made: \n\n Action: ${action} \n XGithubEvent: ${XGithubEvent} \n pullRequestBranch: ${pullRequestBranch} \n commitURL: ${commitURL} \n Subject Branch: ${process.env.SUBJECT_BRANCH} \n Base Branch: ${baseBranch}`);
  }

});

function postToJenkins(payload, jenkinsTargetUrl, token, basicAuth, XGithubDelivery) {
    let data = new FormData();

    data.append('payload', `${JSON.stringify(payload)}`);

    let config = {
      method: 'post',
      url: `${jenkinsTargetUrl}buildWithParameters?token=${token}`,
      headers: {
        'X-Github-Delivery': `${XGithubDelivery}`,
        'X-Github-Event': 'pull_request',
        'Authorization': `Basic ${basicAuth}`,
        ...data.getHeaders()
      },
      data : data
    };

    axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log(error);
    });
}

function updateCommitStatus(commitURL, state, jenkinsTargetUrl, message, accessToken) {
  let data = JSON.stringify({"state":`${state}`,"target_url":`${jenkinsTargetUrl}`,"description":`${message}`,"context":"continuous-integration/jenkins"});

  let config = {
    method: 'post',
    url: `${commitURL}?access_token=${accessToken}`,
    headers: {
      'Content-Type': 'application/json'
    },
    data : data
  };

  axios(config)
  .then(function (response) {
    console.log(JSON.stringify(response.data));
  })
  .catch(function (error) {
    console.log(error);
  });
}

function getPullRequestBranch(payload) {
  return pullRequestBranch = delve(payload, 'pull_request.head.ref');
}

function getBaseBranch(payload) {
  return baseBranch = delve(payload, 'pull_request.base.ref');
}

function getCommitURL(payload) {
  return commitURL = delve(payload, 'pull_request.statuses_url');
}

function getAction(payload) {
  return commitURL = delve(payload, 'action');
}

function getXGithubDelivery(header) {
  return commitURL = delve(header, 'x-github-delivery');
}

function getXGithubEvent(header) {
  return commitURL = delve(header, 'x-github-event');
}