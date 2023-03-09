declare class SigningStargateClientWithLit {
  static createClient(pubKey: any, authSig: any, rpc: any): Promise<SigningStargateClientWithLit>;

  sendTokens(recipient: any, amount: any, fee: any): Promise<any>;
}

export = SigningStargateClientWithLit;