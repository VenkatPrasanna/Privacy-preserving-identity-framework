const keysdb = require("./key.mongo");
const crypto = require("crypto");

async function generateKey() {
  let key = crypto.generateKeySync("aes", { length: 256 });
  return key.export().toString("hex");
}

async function addNewKey(data) {
  await keysdb.findOneAndUpdate(
    {
      dataid: data.dataid,
    },
    data,
    {
      upsert: true,
    }
  );
}

async function getAllKeys() {
  return await keysdb.find({});
}

async function getKeyofData(id) {
  let key = await keysdb.findOne({ dataid: id });
  return key;
}

module.exports = {
  generateKey,
  addNewKey,
  getAllKeys,
  getKeyofData,
};
