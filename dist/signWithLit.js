"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.signCosmosTxWithLit = void 0;
const LitJsSdk = __importStar(require("@lit-protocol/lit-node-client"));
const sha2_1 = require("@ethersproject/sha2");
const encoding_1 = require("@cosmjs/encoding");
const proto_signing_1 = require("@cosmjs/proto-signing");
const amino_1 = require("@cosmjs/amino");
const crypto_1 = require("@cosmjs/crypto");
const code = `
  const sign = async () => {
    const sigShare = await LitActions.signEcdsa({ toSign, publicKey, sigName });
  };
  sign()
`;
function signCosmosTxWithLit({ pkpPublicKey, message, authSig, uint8PubKey }) {
    return __awaiter(this, void 0, void 0, function* () {
        let litNodeClient;
        try {
            litNodeClient = new LitJsSdk.LitNodeClient({
                litNetwork: "serrano",
                debug: false,
            });
            yield litNodeClient.connect();
        }
        catch (err) {
            console.log("Unable to connect to network", err);
            return;
        }
        if (!litNodeClient) {
            console.log("LitNodeClient was not instantiated");
            return;
        }
        const signBytes = (0, proto_signing_1.makeSignBytes)(message);
        const hashedMessage = (0, sha2_1.sha256)(signBytes);
        const uint8Message = (0, encoding_1.fromHex)(hashedMessage.slice(2));
        const jsParams = {
            publicKey: pkpPublicKey,
            toSign: uint8Message,
            sigName: "cosmos",
        };
        let litActionRes;
        try {
            litActionRes = yield litNodeClient.executeJs({
                code: code,
                authSig,
                jsParams: jsParams,
            });
        }
        catch (err) {
            console.log("Unable to execute code", err);
            return;
        }
        const signature = litActionRes.signatures.cosmos;
        const extendedSig = new crypto_1.ExtendedSecp256k1Signature((0, encoding_1.fromHex)(signature.r), (0, encoding_1.fromHex)(signature.s), 0);
        const signatureBytes = new Uint8Array([...extendedSig.r(32), ...extendedSig.s(32)]);
        return (0, amino_1.encodeSecp256k1Signature)(uint8PubKey, signatureBytes);
    });
}
exports.signCosmosTxWithLit = signCosmosTxWithLit;
//# sourceMappingURL=signWithLit.js.map