const stringify = require("json-stringify-deterministic");

module.exports = {
  encode(data) {
    return Buffer.from(stringify(data), "utf8").toString("base64");
  },
  decode(s) {
    return JSON.parse(Buffer.from(s, "base64").toString("utf-8"));
  },
};
