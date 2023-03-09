declare class SigningStargateClientWithLit {
  static createClient(pubKey: string, authSig: any, rpc: any): Promise<SigningStargateClientWithLit>;

  sendTokens(recipient: string, amount: any, fee: any): Promise<any>;
}

export { SigningStargateClientWithLit };