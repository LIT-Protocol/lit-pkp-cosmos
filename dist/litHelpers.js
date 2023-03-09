"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeLogReadableInTerminal = exports.compressPublicKey = exports.pkpPubKeyToCosmosAddress = exports.compressedPubKeyToAddress = void 0;
const crypto_1 = require("@cosmjs/crypto");
const encoding_1 = require("@cosmjs/encoding");
const eth_crypto_1 = __importDefault(require("eth-crypto"));
function pkpPubKeyToCosmosAddress(publicKey) {
    const compressedPublicKey = compressPublicKey(publicKey);
    const uint8ArrayFromHex = (0, encoding_1.fromHex)(compressedPublicKey);
    const compressedBase64PubKey = (0, encoding_1.toBase64)(uint8ArrayFromHex);
    return compressedPubKeyToAddress(compressedBase64PubKey);
}
exports.pkpPubKeyToCosmosAddress = pkpPubKeyToCosmosAddress;
function compressedPubKeyToAddress(publicKey) {
    const encodedCompressedPublicKey = Uint8Array.from(atob(publicKey), (c) => c.charCodeAt(0));
    const address = (0, crypto_1.ripemd160)((0, crypto_1.sha256)(encodedCompressedPublicKey));
    return (0, encoding_1.toBech32)('cosmos', address);
}
exports.compressedPubKeyToAddress = compressedPubKeyToAddress;
function compressPublicKey(publicKey) {
    let cleanedPubKey = publicKey;
    if (publicKey.startsWith('0x')) {
        cleanedPubKey = publicKey.slice(2);
    }
    return eth_crypto_1.default.publicKey.compress(cleanedPubKey);
}
exports.compressPublicKey = compressPublicKey;
function makeLogReadableInTerminal(log) {
    return JSON.stringify(log, null, 2);
}
exports.makeLogReadableInTerminal = makeLogReadableInTerminal;
//# sourceMappingURL=litHelpers.js.map