import { StdFee } from "@cosmjs/amino";
import { EncodeObject, GeneratedType, Registry } from "@cosmjs/proto-signing";
import { HttpEndpoint, Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";
import { AminoTypes } from "@cosmjs/stargate/build/aminotypes";
import { GasPrice } from "@cosmjs/stargate/build/fee";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { DeliverTxResponse, StargateClient, StargateClientOptions } from "@cosmjs/stargate/build/stargateclient";
export declare const defaultRegistryTypes: ReadonlyArray<[string, GeneratedType]>;
/**
 * Signing information for a single signer that is not included in the transaction.
 *
 * @see https://github.com/cosmos/cosmos-sdk/blob/v0.42.2/x/auth/signing/sign_mode_handler.go#L23-L37
 */
export interface SignerData {
    readonly accountNumber: number;
    readonly sequence: number;
    readonly chainId: string;
}
export interface SigningStargateClientOptions extends StargateClientOptions {
    readonly registry?: Registry;
    readonly aminoTypes?: AminoTypes;
    readonly broadcastTimeoutMs?: number;
    readonly broadcastPollIntervalMs?: number;
    readonly gasPrice?: GasPrice;
}
export interface AuthSig {
    sig: string;
    derivedVia: string;
    signedMessage: string;
    address: string;
}
export declare class SigningStargateClientWithLit extends StargateClient {
    readonly registry: Registry;
    readonly broadcastTimeoutMs: number | undefined;
    readonly broadcastPollIntervalMs: number | undefined;
    private readonly pkpPublicKey;
    private readonly compressedPublicKey;
    private readonly authSig;
    private readonly gasPrice;
    protected constructor(pkpPublicKey: string, authSig: AuthSig, tmClient: Tendermint34Client | undefined, options: SigningStargateClientOptions);
    static createClient(pkpPublicKey: string, authSig: AuthSig, endpoint: string | HttpEndpoint, options?: SigningStargateClientOptions): Promise<SigningStargateClientWithLit>;
    sendTokens(recipientAddress: string, amount: readonly Coin[], fee: StdFee, memo?: string): Promise<DeliverTxResponse>;
    signAndBroadcast(signerAddress: string, messages: readonly EncodeObject[], fee: StdFee | any, memo?: string): Promise<DeliverTxResponse>;
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
    sign(signerAddress: string, messages: readonly EncodeObject[], fee: StdFee, memo: string, explicitSignerData?: SignerData): Promise<TxRaw>;
    private signWithLit;
}
