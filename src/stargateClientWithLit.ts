import { encodeSecp256k1Pubkey, StdFee, } from "@cosmjs/amino";
import { fromBase64, fromHex } from "@cosmjs/encoding";
import { Int53 } from "@cosmjs/math";
import {
  EncodeObject,
  encodePubkey,
  GeneratedType,
  makeAuthInfoBytes,
  makeSignDoc,
  Registry,
  TxBodyEncodeObject,
} from "@cosmjs/proto-signing";
import { HttpEndpoint, Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";
import { AminoTypes } from "@cosmjs/stargate/build/aminotypes";
import { GasPrice } from "@cosmjs/stargate/build/fee";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import {
  authzTypes,
  bankTypes,
  distributionTypes,
  feegrantTypes,
  govTypes,
  ibcTypes,
  MsgSendEncodeObject,
  stakingTypes,
  vestingTypes,
} from "@cosmjs/stargate/build/modules";
import { DeliverTxResponse, StargateClient, StargateClientOptions, } from "@cosmjs/stargate/build/stargateclient";
import { compressPublicKey, pkpPubKeyToCosmosAddress, } from "./litHelpers";
import { signCosmosTxWithLit } from "./signWithLit";

export const defaultRegistryTypes: ReadonlyArray<[string, GeneratedType]> = [
  ["/cosmos.base.v1beta1.Coin", Coin],
  ...authzTypes,
  ...bankTypes,
  ...distributionTypes,
  ...feegrantTypes,
  ...govTypes,
  ...stakingTypes,
  ...ibcTypes,
  ...vestingTypes,
];

function createDefaultRegistry(): Registry {
  return new Registry(defaultRegistryTypes);
}


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

export class SigningStargateClientWithLit extends StargateClient {
  public readonly registry: Registry;
  public readonly broadcastTimeoutMs: number | undefined;
  public readonly broadcastPollIntervalMs: number | undefined;

  private readonly pkpPublicKey: string;
  private readonly compressedPublicKey: string;
  private readonly authSig: AuthSig;
  private readonly gasPrice: GasPrice | undefined;

  protected constructor(
    pkpPublicKey: string,
    authSig: AuthSig,
    tmClient: Tendermint34Client | undefined,
    options: SigningStargateClientOptions
  ) {
    super(tmClient, options);
    const {
      registry = createDefaultRegistry(),
    } = options;
    this.registry = registry;
    this.pkpPublicKey = pkpPublicKey;
    this.authSig = authSig;
    this.compressedPublicKey = compressPublicKey(pkpPublicKey);
    this.broadcastTimeoutMs = options.broadcastTimeoutMs;
    this.broadcastPollIntervalMs = options.broadcastPollIntervalMs;
    this.gasPrice = options.gasPrice;
  }

  public static async createClient(
    pkpPublicKey: string,
    authSig: AuthSig,
    endpoint: string | HttpEndpoint,
    // signer: OfflineSigner,
    options: SigningStargateClientOptions = {}
  ): Promise<SigningStargateClientWithLit> {
    const tmClient = await Tendermint34Client.connect(endpoint);
    return new SigningStargateClientWithLit(
      pkpPublicKey,
      authSig,
      tmClient,
      options
    );
  }

  public async sendTokens(
    recipientAddress: string,
    amount: readonly Coin[],
    fee: StdFee,
    memo = ""
  ): Promise<DeliverTxResponse> {
    const senderAddress = pkpPubKeyToCosmosAddress(this.pkpPublicKey);
    // creates message for transaction
    const sendMsg: MsgSendEncodeObject = {
      typeUrl: "/cosmos.bank.v1beta1.MsgSend",
      value: {
        fromAddress: senderAddress,
        toAddress: recipientAddress,
        amount: [...amount],
      },
    };
    return this.signAndBroadcast(senderAddress, [sendMsg], fee, memo);
  }

  public async signAndBroadcast(
    signerAddress: string,
    messages: readonly EncodeObject[],
    fee: StdFee | any,
    memo = ""
  ): Promise<DeliverTxResponse> {
    let usedFee: StdFee = fee;
    const txRaw = await this.sign(signerAddress, messages, usedFee, memo);
    const txBytes = TxRaw.encode(txRaw).finish();
    return this.broadcastTx(txBytes);
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
  public async sign(
    signerAddress: string,
    messages: readonly EncodeObject[],
    fee: StdFee,
    memo: string,
    explicitSignerData?: SignerData
  ): Promise<TxRaw> {
    let signerData: SignerData;
    if (explicitSignerData) {
      signerData = explicitSignerData;
    } else {
      const {accountNumber, sequence} = await this.getSequence(signerAddress);
      const chainId = await this.getChainId();
      signerData = {
        accountNumber: accountNumber,
        sequence: sequence,
        chainId: chainId,
      };
    }

    return this.signWithLit(signerAddress, messages, fee, memo, signerData);
  }

  private async signWithLit(
    signerAddress: string,
    messages: readonly EncodeObject[],
    fee: StdFee,
    memo: string,
    {accountNumber, sequence, chainId}: SignerData
  ): Promise<TxRaw> {
    const uint8PubKey = fromHex(this.compressedPublicKey);
    const txBodyEncodeObject: TxBodyEncodeObject = {
      typeUrl: "/cosmos.tx.v1beta1.TxBody",
      value: {
        messages: messages,
        memo: memo,
      },
    };

    const txBodyBytes = this.registry.encode(txBodyEncodeObject);
    const encodedPubKey = encodePubkey(encodeSecp256k1Pubkey(uint8PubKey));
    const gasLimit = Int53.fromString(fee.gas).toNumber();

    const authInfoBytes = makeAuthInfoBytes(
      [{pubkey: encodedPubKey, sequence}],
      fee.amount,
      gasLimit,
      fee.granter,
      fee.payer
    );

    const signDoc = makeSignDoc(
      txBodyBytes,
      authInfoBytes,
      chainId,
      accountNumber
    );

    const signerObj = {
      pkpPublicKey: this.pkpPublicKey,
      message: signDoc,
      authSig: this.authSig,
      uint8PubKey
    };

    const {signature} = await signCosmosTxWithLit(signerObj);

    const txRawObj = {
      bodyBytes: signDoc.bodyBytes,
      authInfoBytes: signDoc.authInfoBytes,
      signatures: [fromBase64(signature)],
    }
    return TxRaw.fromPartial(txRawObj);
  }
}
