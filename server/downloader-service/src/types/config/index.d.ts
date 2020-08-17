declare module 'config' {
  declare var config: Config;

  interface Config {
    port: string,
    hostname: string,
    storagePath: string,
    gateway: GatewayOptions
  }

  interface GatewayOptions {
    address: string,
    torrentStatsReceiver: any,
  }

  export = config;
}
