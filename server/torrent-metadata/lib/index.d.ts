/// <reference types="node" />
export interface TorrentInfo {
    'name.utf-8'?: string;
    name?: string;
    files?: File[];
    'piece length'?: number;
    pieces?: number;
    private?: boolean;
}
export interface ParsedFile {
    path: string;
    name: string;
    length: number;
    offset: number;
}
export interface Metadata {
    info?: TorrentInfo;
    infoBuffer?: Buffer;
    infoHash: string;
    comment?: string;
    infoHashBuffer?: Buffer;
    name?: string;
    private?: boolean;
    created?: Date;
    createdBy?: string;
    announce?: string[];
    urlList?: string[];
    pieceLength?: number;
    lastPieceLength?: number;
    pieces?: string[];
    length: number;
    files?: ParsedFile[];
}
export interface Options {
    selfId?: Buffer;
    selfPort?: number;
    timeout?: number;
    socketTimeout?: number;
    maxConns?: number;
}
export interface DefaultOptions {
    selfId: Buffer;
    selfPort: number;
    timeout: number;
    socketTimeout: number;
    maxConns: number;
}
/**
 * Extracts torrent metadata
 * @param torrent .torrent file | infohash | magnet link
 */
export declare const getMetadata: (torrent: string | Buffer, options?: Options) => Promise<Metadata>;
declare const _default: {
    getMetadata: (torrent: string | Buffer, options?: Options) => Promise<Metadata>;
};
export default _default;
