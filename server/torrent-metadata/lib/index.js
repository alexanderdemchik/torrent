"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMetadata = void 0;
var torrent_discovery_1 = __importDefault(require("torrent-discovery"));
var parse_torrent_1 = __importDefault(require("parse-torrent"));
var net_1 = __importDefault(require("net"));
var bittorrent_protocol_1 = __importDefault(require("bittorrent-protocol"));
var ut_metadata_1 = __importDefault(require("ut_metadata"));
var crypto_1 = __importDefault(require("crypto"));
var bencode_1 = __importDefault(require("bencode"));
var defaultOptions = {
    selfId: crypto_1.default.randomBytes(20),
    selfPort: 49000,
    timeout: 10000,
    socketTimeout: 5000,
    maxConns: 50
};
/**
 * Extracts torrent metadata
 * @param torrent .torrent file | infohash | magnet link
 */
exports.getMetadata = function (torrent, options) {
    if (options === void 0) { options = {}; }
    return __awaiter(void 0, void 0, void 0, function () {
        var opts, peerQueue, parsed, infoHash, pool, discovery, meta;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    opts = __assign(__assign({}, defaultOptions), options);
                    peerQueue = [];
                    parsed = parse_torrent_1.default(torrent);
                    // in case of .torrent file - just return parsed file
                    if (torrent instanceof Buffer && parsed.length && parsed.name) {
                        return [2 /*return*/, parsed];
                    }
                    infoHash = parsed.infoHash;
                    pool = new SocketPool();
                    discovery = new torrent_discovery_1.default({
                        infoHash: infoHash,
                        peerId: opts.selfId,
                        port: opts.selfPort,
                        announce: parsed.announce || []
                    });
                    return [4 /*yield*/, new Promise(function (resolve, reject) {
                            var handlePeer = function (peer) { return __awaiter(void 0, void 0, void 0, function () {
                                var _a, id, socket, meta_1, err_1;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            if (pool.size >= opts.maxConns) {
                                                peerQueue.push(peer);
                                            }
                                            _a = pool.createSocket(), id = _a.id, socket = _a.socket;
                                            _b.label = 1;
                                        case 1:
                                            _b.trys.push([1, 3, , 4]);
                                            return [4 /*yield*/, getMetadataFromPeer(infoHash, peer, { socket: socket, selfId: opts.selfId, timeout: opts.socketTimeout })];
                                        case 2:
                                            meta_1 = _b.sent();
                                            resolve(meta_1);
                                            return [3 /*break*/, 4];
                                        case 3:
                                            err_1 = _b.sent();
                                            pool.destroySocket(id);
                                            if (peerQueue.length > 0) {
                                                // @ts-ignore
                                                handlePeer(peerQueue.shift());
                                            }
                                            return [3 /*break*/, 4];
                                        case 4: return [2 /*return*/];
                                    }
                                });
                            }); };
                            discovery.on('peer', function (peer) {
                                handlePeer(peer);
                            });
                            discovery.on('error', function (err) {
                                reject(err);
                            });
                            setTimeout(function () {
                                reject(new Error('Timeout error'));
                            }, opts.timeout);
                        })];
                case 1:
                    meta = _a.sent();
                    discovery.removeAllListeners().destroy();
                    pool.destroyAllSockets();
                    return [2 /*return*/, meta];
            }
        });
    });
};
/**
 * Obtain torrent metadata from peer
 * @param infoHash infoHash of torrent
 * @param peer peer - string in format "ip:port"
 * @param socket {@link net.Socket}
 */
var getMetadataFromPeer = function (infoHash, peer, opts) {
    if (opts === void 0) { opts = {}; }
    return __awaiter(void 0, void 0, void 0, function () {
        var timeout, socket, selfId, _a, address, port;
        return __generator(this, function (_b) {
            timeout = opts.timeout || defaultOptions.socketTimeout;
            socket = opts.socket || new net_1.default.Socket();
            selfId = opts.selfId || defaultOptions.selfId;
            _a = __read(peer.split(':'), 2), address = _a[0], port = _a[1];
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    socket.setTimeout(timeout, function () {
                        socket.destroy();
                        var err = new Error("socket timeout after " + timeout + "ms");
                        reject(err);
                    });
                    socket.connect(Number(port), address, function () {
                        var wire = new bittorrent_protocol_1.default();
                        socket.pipe(wire).pipe(socket);
                        wire.use(ut_metadata_1.default());
                        wire.handshake(infoHash, selfId, { dht: true });
                        wire.on('handshake', function () {
                            wire.ut_metadata.fetch();
                        });
                        wire.ut_metadata.on('metadata', function (rawMetadata) {
                            var metadata = null;
                            var parsedMetadata = null;
                            try {
                                metadata = bencode_1.default.decode(rawMetadata);
                                console.log(metadata);
                                var infohashOfRawMetadata = crypto_1.default.createHash('sha1').update(bencode_1.default.encode(metadata.info)).digest('hex');
                                // Verify the infohash of received metadata.
                                if (infohashOfRawMetadata.toString() !== infoHash) {
                                    metadata = null;
                                }
                            }
                            catch (err) {
                                metadata = null;
                            }
                            ;
                            socket.destroy();
                            if (metadata === null) {
                                return socket.emit('error', new Error('fail to fetch metadata'));
                            }
                            parsedMetadata = parse_torrent_1.default(rawMetadata);
                            resolve(parsedMetadata);
                        });
                    });
                    socket.on('error', function (err) {
                        !socket.destroyed && socket.destroy();
                        reject(err);
                    });
                })];
        });
    });
};
/**
 * Helper class to controll sockets
 */
var SocketPool = /** @class */ (function () {
    function SocketPool() {
        this.pool = new Map();
        this.idsSequence = 0;
    }
    Object.defineProperty(SocketPool.prototype, "size", {
        get: function () {
            return this.pool.size;
        },
        enumerable: false,
        configurable: true
    });
    SocketPool.prototype.createSocket = function () {
        var socket = new net_1.default.Socket();
        this.pool.set(++this.idsSequence, socket);
        return { socket: socket, id: this.idsSequence };
    };
    SocketPool.prototype.destroySocket = function (socketId) {
        if (!this.pool.has(socketId))
            return;
        var socket = this.pool.get(socketId);
        if (socket && !socket.destroyed) {
            socket.destroy();
        }
        this.pool.delete(socketId);
    };
    SocketPool.prototype.destroyAllSockets = function () {
        var e_1, _a;
        try {
            for (var _b = __values(this.pool.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var socket = _c.value;
                !socket.destroyed && socket.destroy();
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        this.pool.clear();
    };
    return SocketPool;
}());
exports.default = { getMetadata: exports.getMetadata };
