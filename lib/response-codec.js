module.exports = {
  encode({ headers, chunks }) {
    return JSON.stringify({
      headers,
      chunks: chunks.map((chunk) => chunk.toString("base64")),
    });
  },
  decode(s) {
    const a = JSON.parse(s);
    a.chunks = a.chunks.map((bufferString) =>
      Buffer.from(bufferString, "base64")
    );
    return a;
  },
};
