import { ripemd160, sha256 } from "@cosmjs/crypto";
import { fromHex, toBase64, toBech32 } from "@cosmjs/encoding";
import EthCrypto from "eth-crypto";

function pkpPubKeyToCosmosAddress(publicKey: string): string {
  const compressedPublicKey = compressPublicKey(publicKey);
  const uint8ArrayFromHex = fromHex(compressedPublicKey);
  const compressedBase64PubKey = toBase64(uint8ArrayFromHex);
  return compressedPubKeyToAddress(compressedBase64PubKey);
}

function compressedPubKeyToAddress(publicKey: string): any {
  const encodedCompressedPublicKey = Uint8Array.from(atob(publicKey), (c) => c.charCodeAt(0));
  const address = ripemd160(sha256(encodedCompressedPublicKey));
  return toBech32('cosmos', address);
}

function compressPublicKey(publicKey: string): string {
  let cleanedPubKey = publicKey;
  if (publicKey.startsWith('0x')) {
    cleanedPubKey = publicKey.slice(2);
  }
  return EthCrypto.publicKey.compress(cleanedPubKey);
}

function makeLogReadableInTerminal(log: any) {
  return JSON.stringify(log, null, 2);
}

export {
  compressedPubKeyToAddress,
  pkpPubKeyToCosmosAddress,
  compressPublicKey,
  makeLogReadableInTerminal,
}

