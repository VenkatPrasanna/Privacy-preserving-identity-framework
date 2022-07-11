const express = require("express");

const {
  generateAESKey,
  httpAddKey,
  httpGetAllKeys,
  getKeybyID,
} = require("./keys.controller");

const keysRouter = express.Router();

keysRouter.get("/genkey", generateAESKey);
keysRouter.post("/addKey", httpAddKey);
keysRouter.get("/allkeys", httpGetAllKeys);
keysRouter.get("/keybyid", getKeybyID);

module.exports = keysRouter;
