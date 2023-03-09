import { DeliverTxResponse } from "@cosmjs/stargate/build/stargateclient";

declare class SigningStargateClientWithLit {
  constructor(pubKey: string, authSig: any, rpc: string, options: any);

  static createClient(pubKey: string, authSig: any, rpc: string): Promise<SigningStargateClientWithLit>;

  sendTokens(recipient: string, amount: any, fee: any): Promise<DeliverTxResponse>;
}

export { SigningStargateClientWithLit };