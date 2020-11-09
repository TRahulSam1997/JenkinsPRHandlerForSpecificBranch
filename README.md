# Jenkins Pull Request Handler For A Specific Branch
  The plugins I could find to integrate Jenkins with GitHub did not allow me to target a specific branch, or maybe they did, and I missed it. Furthermore, I wanted to have the freedom to manipulate the webhook GitHub sends when some action is done to a repository.

  So, I built this simple Node.js service which acts as a conduit between GitHub and Jenkins.

### What does this service do?
  It captures the payload, allows you to manipulate it and then sends a POST request to Jenkins. For my user case, I have specified the POST request to be sent to Jenkins (triggering a pipeline) only when a pull request is made to a branch I specify in the service.

### How to use?
  1) Clone `JenkinsPRHandlerForSpecificBranch` repository into your project folder.
  ```https://github.com/TRahulSam1997/JenkinsPRHandlerForSpecificBranch```
  2) Install [Docker](https://www.docker.com/) if you haven't got it already.
  3) cd `JenkinsPRHandlerForSpecificBranch`
  4) Set the **.env** variables in `docker-compose.yml`
  ```
      PORT: 8080
      GITHUB_TOKEN: undefined
      JENKINS_BASE_URL: undefined
      JENKINS_BASIC_AUTH: undefined
      GITHUB_STATE: undefined
      MESSAGE: undefined
      JENKINS_TOKEN: undefined
      SUBJECT_BRANCH: undefined
  ```
  **PORT:** By defualt I've set the port to 8080.

  5) run `docker-compose up -d`
