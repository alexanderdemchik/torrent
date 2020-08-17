declare module 'config' {
  declare var config: Config;

  interface Config {
    port: number,
    torrent: {
      statsReceiver: {
        port: number
      }
    },
    db: {
      url: string
    }
  }

  interface GatewayOptions {
    address: String,
    torrentStatusReceiver: any
  }

  export = config;
}
