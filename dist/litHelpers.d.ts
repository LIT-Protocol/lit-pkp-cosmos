declare function pkpPubKeyToCosmosAddress(publicKey: string): string;
declare function compressedPubKeyToAddress(publicKey: string): any;
declare function compressPublicKey(publicKey: string): string;
declare function makeLogReadableInTerminal(log: any): string;
export { compressedPubKeyToAddress, pkpPubKeyToCosmosAddress, compressPublicKey, makeLogReadableInTerminal, };
