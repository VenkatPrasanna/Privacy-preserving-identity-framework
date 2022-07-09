const crypto = require("crypto");

async function generateKey() {
  let key = crypto.generateKeySync("aes", { length: 256 });
  return key.export().toString("hex");
}

module.exports = {
  generateKey,
};
