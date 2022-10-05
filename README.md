# cachemuni

## Overview

`cachemuni` makes it easy to cache/invalidate HTTP endpoints in nodejs.

## Example usage

```javascript
const express = require("express");
const { HttpCachingServer } = require("cachemuni");
const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/invalidate", (req, res) => {
  res.send("cache invalidated");
});

app.listen(port);

const cachingServer = new HttpCachingServer({
  targetHostName: "localhost",
  targetPort: 3000,
  config: {
    "/": {
      invalidateOn: ["POST /invalidate"],
    },
  },
});

cachingServer.listen(3001);
```

## API

### HttpCachingServer

HttpCachingServer is the same as [http's Server object](https://nodejs.org/api/http.html#class-httpserver) except the constructor takes in:

```typescript
{
    targetHostName: string;
    targetPort: number;
    store?: Store;
    config?: Record<string, { invalidateOn?: string[] }>;
    serverOptions?: http.ServerOptions;
    considerHeaders?: string;
  }
```

### Store

Store is a basic key/value string store which supports async. You can use a persisted store (redis, psql, etc.) or just a basic in memory store. If you do not pass an option, it defaults to a basic in memory store.

```typescript
{
  get(k: string): Promise<string>;
  set(k: string, v: string): Promise<this>;
  remove(k: string): Promise<this>;
}
```
