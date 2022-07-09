const express = require("express");

const {
  generateAESKey,
  httpAddKey,
  httpGetAllKeys,
} = require("./keys.controller");

const keysRouter = express.Router();

keysRouter.get("/genkey", generateAESKey);
keysRouter.post("/addKey", httpAddKey);
keysRouter.get("/allkeys", httpGetAllKeys);

module.exports = keysRouter;
