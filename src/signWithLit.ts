import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { sha256 } from "@ethersproject/sha2";
import { fromHex } from "@cosmjs/encoding";
import { makeSignBytes } from "@cosmjs/proto-signing";
import { encodeSecp256k1Signature } from "@cosmjs/amino";
import { ExtendedSecp256k1Signature } from "@cosmjs/crypto";

interface SignCosmosTxWithLitParams {
  pkpPublicKey: string;
  message: any;
  authSig: any;
  uint8PubKey: Uint8Array;
}

const code = `
  const sign = async () => {
    const sigShare = await LitActions.signEcdsa({ toSign, publicKey, sigName });
  };
  sign()
`;

async function signCosmosTxWithLit({
                                     pkpPublicKey,
                                     message,
                                     authSig,
                                     uint8PubKey
                                   }: SignCosmosTxWithLitParams): Promise<any> {
  let litNodeClient;
  try {
    litNodeClient = new LitJsSdk.LitNodeClient({
      litNetwork: "serrano",
      debug: false,
    });
    await litNodeClient.connect();
  } catch (err) {
    console.log("Unable to connect to network", err);
    return;
  }

  if (!litNodeClient) {
    console.log("LitNodeClient was not instantiated");
    return;
  }

  const signBytes = makeSignBytes(message);
  const hashedMessage = sha256(signBytes);
  const uint8Message = fromHex(hashedMessage.slice(2));

  const jsParams = {
    publicKey: pkpPublicKey,
    toSign: uint8Message,
    sigName: "cosmos",
  };

  let litActionRes;
  try {
    litActionRes = await litNodeClient.executeJs({
      code: code,
      authSig,
      jsParams: jsParams,
    });
  } catch (err) {
    console.log("Unable to execute code", err);
    return;
  }

  const signature = litActionRes.signatures.cosmos;
  const extendedSig = new ExtendedSecp256k1Signature(
    fromHex(signature.r),
    fromHex(signature.s),
    0,
  );
  const signatureBytes = new Uint8Array([...extendedSig.r(32), ...extendedSig.s(32)]);
  return encodeSecp256k1Signature(uint8PubKey, signatureBytes);
}

export { signCosmosTxWithLit };
