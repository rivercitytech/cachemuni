import http from "http";

class Store {
  get(k: string): Promise<string>;
  set(k: string, v: string): Promise<this>;
  remove(k: string): Promise<this>;
}

class HttpCachingServerTypedef extends http.Server {
  public constructor({
    targetHostName,
    targetPort = 80,
    store = new BasicStore(),
    config = {},
    serverOptions = {},
  }: {
    targetHostName: string;
    targetPort: number;
    store?: Store;
    config?: Record<string, { invalidateOn?: string[] }>;
    serverOptions?: http.ServerOptions;
  });
}

export declare const HttpCachingServer: typeof HttpCachingServerTypedef;
