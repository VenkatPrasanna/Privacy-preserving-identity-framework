//const app = require("../../app");

const {
  generateKey,
  addNewKey,
  getAllKeys,
  getKeyofData,
} = require("../../models/key.model");

async function generateAESKey(req, res) {
  const key = await generateKey();
  return res.status(200).json(key);
}

async function httpAddKey(req, res) {
  const data = req.body;
  if (!data.dataid || !data.key) {
    return res.status(400).json({
      error: "Invalid key parameters",
    });
  }

  await addNewKey(data);
  return res.status(201).json({
    message: `Dataset ${data.id} added successfully`,
  });
}

async function getKeybyID(req, res) {
  console.log("req is");
  console.log(req.body);
}

async function httpGetAllKeys(req, res) {
  const allkeys = await getAllKeys();
  return res.status(200).json(allkeys);
}

module.exports = {
  generateAESKey,
  httpAddKey,
  httpGetAllKeys,
  getKeybyID,
};
