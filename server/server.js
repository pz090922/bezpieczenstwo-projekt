const express = require("express");
const cors = require("cors");
const { port, keycloak_secret } = require("./config");
const apiRouter = require("./routes/api");
const bodyParser = require("body-parser");
const multer = require("multer");
const Keycloak = require('keycloak-connect');
const session = require('express-session');
const userActions = require("./actions/api/userActions");
require("./db/mongoose");

const app = express();

const memoryStore = new session.MemoryStore();
app.use(session({
  secret: 'some secret',
  resave: false,
  saveUninitialized: true,
  store: memoryStore
}));
const keycloak = new Keycloak({ store: memoryStore },{
  "realm": "instagram-realm",
  "auth-server-url": "http://localhost:8080/",
  "ssl-required": "external",
  "resource": "backend-api",
  "verify-token-audience": true,
  "credentials": {
    "secret": "**********"
  },
  "use-resource-role-mappings": true,
  "confidential-port": 0,
  "policy-enforcer": {
    "credentials": {}
  },
  "bearer-only": true,
});


app.use(cors());
app.use(keycloak.middleware())
app.use(bodyParser.json());
app.use(express.static("public"));

require("./db/mongoose");
app.use("/api/", keycloak.protect('user') ,apiRouter);


app.listen(port, () => {
  console.log(`Server on port: ${port}`);
});
