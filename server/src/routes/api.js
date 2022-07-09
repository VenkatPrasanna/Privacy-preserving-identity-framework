const express = require("express");

const keysRouter = require("./keys/keys.router");

const api = express.Router();

api.use("/keys", keysRouter);

module.exports = api;
