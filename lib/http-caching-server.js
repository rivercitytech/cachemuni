const HttpCachingServerAdvisor = require("./http-caching-server-advisor");
const { request, Server } = require("http");
const BasicStore = require("./basic-store");

class HttpCachingServer extends Server {
  #store;
  #config;

  constructor({
    targetHostName,
    targetPort = 80,
    store = new BasicStore(),
    config = {},
    serverOptions = {},
  }) {
    super(serverOptions, async (req, res) => {
      const advisor = new HttpCachingServerAdvisor(
        req,
        res,
        this.#store,
        this.#config
      );
      if (await advisor.maybeReturnedCachedResponse()) {
        return;
      }
      const chunks = [];
      const proxy = request(
        {
          hostname: targetHostName,
          port: targetPort,
          path: req.url,
          method: req.method,
          headers: req.headers,
        },
        (proxyRes) => {
          res.writeHead(proxyRes.statusCode, proxyRes.headers);
          proxyRes.pipe(res, { end: true }).on("finish", async () => {
            await advisor.cacheResponse(chunks);
            await advisor.invalidateCache();
          });
          proxyRes.on("data", (chunk) => chunks.push(chunk));
        }
      );
      req.pipe(proxy, { end: true });
    });
    this.#store = store;
    this.#config = config;
  }
}

module.exports = HttpCachingServer;
