const { encode: encodeRequest } = require("./request-codec");
const {
  encode: encodeResponse,
  decode: decodeResponse,
} = require("./response-codec");

class HttpCachingServerAdvisor {
  #req;
  #res;
  #store;
  #config;
  #considerHeaders;

  #key() {
    return encodeRequest(
      {
        url: this.#req.url,
        headers: this.#req.headers,
        method: this.#req.method,
      },
      this.#considerHeaders
    );
  }

  #urlKey() {
    return this.#req.url.split("?")[0];
  }

  constructor(req, res, store, config, considerHeaders) {
    this.#req = req;
    this.#res = res;
    this.#store = store;
    this.#config = config;
    this.#considerHeaders = considerHeaders;
  }

  async maybeReturnedCachedResponse() {
    const urlKey = this.#urlKey();
    if (!(urlKey in this.#config)) {
      return;
    }
    const cachedData = await this.#store.get(this.#key());
    if (!cachedData) {
      return false;
    }
    const { chunks, headers } = decodeResponse(cachedData);
    this.#res.setHeader("x-cachemuni-cached", "true");
    for (const [key, value] of Object.entries(headers)) {
      this.#res.setHeader(key, value);
    }
    await Promise.all(
      chunks.map(
        (chunk) => new Promise((resolve) => this.#res.write(chunk, resolve))
      )
    );
    this.#req.pipe(this.#res, { end: true });
    return true;
  }

  async cacheResponse(chunks) {
    if (this.#req.method === "GET" && this.#urlKey() in this.#config) {
      const key = this.#key();
      const urlKey = this.#urlKey();
      const urlLookup =
        JSON.parse((await this.#store.get(urlKey)) ?? null) ?? [];
      await this.#store.set(urlKey, JSON.stringify([...urlLookup, key]));
      await this.#store.set(
        key,
        encodeResponse({
          headers: this.#req.headers,
          chunks,
        })
      );
    }
  }

  async invalidateCache() {
    await Promise.all(
      Object.keys(this.#config).map(async (key) => {
        const config = this.#config[key];
        for (const invalidateOnAtom of config.invalidateOn ?? []) {
          const [method, url] = invalidateOnAtom.split(" ");
          let methodMatches = false;
          let urlMatches = false;
          if (
            method === "*" ||
            this.#req.method.toLowerCase() === method.toLowerCase()
          ) {
            methodMatches = true;
          }
          const [lazyGlobPart] = url.split("*");
          if (this.#urlKey().startsWith(lazyGlobPart)) {
            urlMatches = true;
          }
          if (!(methodMatches && urlMatches)) {
            continue;
          }
          const keys = JSON.parse((await this.#store.get(key)) ?? null);
          if (!keys) {
            return;
          }
          await Promise.all(keys.map((k) => this.#store.remove(k)));
          await this.#store.remove(key);
          return;
        }
      })
    );
  }
}

module.exports = HttpCachingServerAdvisor;
