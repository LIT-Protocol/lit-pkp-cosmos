"use strict";
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
exports.SigningStargateClientWithLit = exports.defaultRegistryTypes = void 0;
const amino_1 = require("@cosmjs/amino");
const encoding_1 = require("@cosmjs/encoding");
const math_1 = require("@cosmjs/math");
const proto_signing_1 = require("@cosmjs/proto-signing");
const tendermint_rpc_1 = require("@cosmjs/tendermint-rpc");
const coin_1 = require("cosmjs-types/cosmos/base/v1beta1/coin");
const tx_1 = require("cosmjs-types/cosmos/tx/v1beta1/tx");
const modules_1 = require("@cosmjs/stargate/build/modules");
const stargateclient_1 = require("@cosmjs/stargate/build/stargateclient");
const litHelpers_1 = require("./litHelpers");
const signWithLit_1 = require("./signWithLit");
exports.defaultRegistryTypes = [
    ["/cosmos.base.v1beta1.Coin", coin_1.Coin],
    ...modules_1.authzTypes,
    ...modules_1.bankTypes,
    ...modules_1.distributionTypes,
    ...modules_1.feegrantTypes,
    ...modules_1.govTypes,
    ...modules_1.stakingTypes,
    ...modules_1.ibcTypes,
    ...modules_1.vestingTypes,
];
function createDefaultRegistry() {
    return new proto_signing_1.Registry(exports.defaultRegistryTypes);
}
class SigningStargateClientWithLit extends stargateclient_1.StargateClient {
    constructor(pkpPublicKey, authSig, tmClient, options) {
        super(tmClient, options);
        const { registry = createDefaultRegistry(), } = options;
        this.registry = registry;
        this.pkpPublicKey = pkpPublicKey;
        this.authSig = authSig;
        this.compressedPublicKey = (0, litHelpers_1.compressPublicKey)(pkpPublicKey);
        this.broadcastTimeoutMs = options.broadcastTimeoutMs;
        this.broadcastPollIntervalMs = options.broadcastPollIntervalMs;
        this.gasPrice = options.gasPrice;
    }
    static createClient(pkpPublicKey, authSig, endpoint, 
    // signer: OfflineSigner,
    options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const tmClient = yield tendermint_rpc_1.Tendermint34Client.connect(endpoint);
            return new SigningStargateClientWithLit(pkpPublicKey, authSig, tmClient, options);
        });
    }
    sendTokens(recipientAddress, amount, fee, memo = "") {
        return __awaiter(this, void 0, void 0, function* () {
            const senderAddress = (0, litHelpers_1.pkpPubKeyToCosmosAddress)(this.pkpPublicKey);
            // creates message for transaction
            const sendMsg = {
                typeUrl: "/cosmos.bank.v1beta1.MsgSend",
                value: {
                    fromAddress: senderAddress,
                    toAddress: recipientAddress,
                    amount: [...amount],
                },
            };
            return this.signAndBroadcast(senderAddress, [sendMsg], fee, memo);
        });
    }
    signAndBroadcast(signerAddress, messages, fee, memo = "") {
        return __awaiter(this, void 0, void 0, function* () {
            let usedFee = fee;
            const txRaw = yield this.sign(signerAddress, messages, usedFee, memo);
            const txBytes = tx_1.TxRaw.encode(txRaw).finish();
            return this.broadcastTx(txBytes);
        });
    }
    /**
     * Gets account number and sequence from the API, creates a sign doc,
     * creates a single signature and assembles the signed transaction.
     *
     * The sign mode (SIGN_MODE_DIRECT or SIGN_MODE_LEGACY_AMINO_JSON) is determined by this client's signer.
     *
     * You can pass signer data (account number, sequence and chain ID) explicitly instead of querying them
     * from the chain. This is needed when signing for a multisig account, but it also allows for offline signing
     * (See the SigningStargateClient.offline constructor).
     */
    sign(signerAddress, messages, fee, memo, explicitSignerData) {
        return __awaiter(this, void 0, void 0, function* () {
            let signerData;
            if (explicitSignerData) {
                signerData = explicitSignerData;
            }
            else {
                const { accountNumber, sequence } = yield this.getSequence(signerAddress);
                const chainId = yield this.getChainId();
                signerData = {
                    accountNumber: accountNumber,
                    sequence: sequence,
                    chainId: chainId,
                };
            }
            return this.signWithLit(signerAddress, messages, fee, memo, signerData);
        });
    }
    signWithLit(signerAddress, messages, fee, memo, { accountNumber, sequence, chainId }) {
        return __awaiter(this, void 0, void 0, function* () {
            const uint8PubKey = (0, encoding_1.fromHex)(this.compressedPublicKey);
            const txBodyEncodeObject = {
                typeUrl: "/cosmos.tx.v1beta1.TxBody",
                value: {
                    messages: messages,
                    memo: memo,
                },
            };
            const txBodyBytes = this.registry.encode(txBodyEncodeObject);
            const encodedPubKey = (0, proto_signing_1.encodePubkey)((0, amino_1.encodeSecp256k1Pubkey)(uint8PubKey));
            const gasLimit = math_1.Int53.fromString(fee.gas).toNumber();
            const authInfoBytes = (0, proto_signing_1.makeAuthInfoBytes)([{ pubkey: encodedPubKey, sequence }], fee.amount, gasLimit, fee.granter, fee.payer);
            const signDoc = (0, proto_signing_1.makeSignDoc)(txBodyBytes, authInfoBytes, chainId, accountNumber);
            const signerObj = {
                pkpPublicKey: this.pkpPublicKey,
                message: signDoc,
                authSig: this.authSig,
                uint8PubKey
            };
            const { signature } = yield (0, signWithLit_1.signCosmosTxWithLit)(signerObj);
            const txRawObj = {
                bodyBytes: signDoc.bodyBytes,
                authInfoBytes: signDoc.authInfoBytes,
                signatures: [(0, encoding_1.fromBase64)(signature)],
            };
            return tx_1.TxRaw.fromPartial(txRawObj);
        });
    }
}
exports.SigningStargateClientWithLit = SigningStargateClientWithLit;
//# sourceMappingURL=stargateClientWithLit.js.map