const stringify = require("json-stringify-deterministic");

module.exports = {
  encode(data, considerHeaders) {
    data.headers = considerHeaders.length
      ? Object.entries(data.headers).reduce(
          (acc, [k, v]) =>
            considerHeaders.indexOf(k) !== -1 ? { ...acc, [k]: v } : acc,
          {}
        )
      : data.headers;
    return Buffer.from(stringify(data), "utf8").toString("base64");
  },
  decode(s) {
    return JSON.parse(Buffer.from(s, "base64").toString("utf-8"));
  },
};
