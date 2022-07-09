const keysdb = require("./key.mongo");
const crypto = require("crypto");

async function generateKey() {
  let key = crypto.generateKeySync("aes", { length: 256 });
  return key.export().toString("hex");
}

async function addNewKey(data) {
  console.log("ddgj");
  console.log(data);
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

module.exports = {
  generateKey,
  addNewKey,
  getAllKeys,
};
