interface SignCosmosTxWithLitParams {
    pkpPublicKey: string;
    message: any;
    authSig: any;
    uint8PubKey: Uint8Array;
}
declare function signCosmosTxWithLit({ pkpPublicKey, message, authSig, uint8PubKey }: SignCosmosTxWithLitParams): Promise<any>;
export { signCosmosTxWithLit };
