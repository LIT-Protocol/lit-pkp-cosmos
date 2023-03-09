import { fromHex, toHex } from "@cosmjs/encoding";
import { keccak256, Secp256k1 } from "@cosmjs/crypto";
import { pkpPubKeyToCosmosAddress } from "./litHelpers";
import secp256k1 from "secp256k1";
import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { pubkeyToAddress } from "@cosmjs/amino";

const keplrMnemonicString = 'either control crazy lonely police foam swim replace salute snap quick harbor';
const keplrAddress = 'cosmos16a6zyjwyww6scfa44s9jekdwwjfjrpppajk9d0';
const keplrPubKey = new Uint8Array([
  2, 246, 84, 18, 18, 44, 210, 108,
  254, 182, 178, 122, 254, 228, 57, 254,
  89, 134, 104, 35, 144, 69, 137, 41,
  155, 100, 240, 40, 193, 126, 48, 195,
  130
]);

const pkpOwnerPubKey = "0x04507302fc8404fe81260ed233a2d79f209f6789948b4fb31811fe9099bd0459ec8d7c893d10b65c8dd72a296084e8729dfeb13265c3d33d6b6fd6bad92616efad"
const pkpOwnerCosmAddress = 'cosmos1fldnt64nje2uxz7p4s3hh7f5dgzm0y04jd27fx';
const pkpOwnerCompressedPubKey = "0x03507302fc8404fe81260ed233a2d79f209f6789948b4fb31811fe9099bd0459ec"
const pkpOwnerAddress = '0x20623933681a53D5ee48959eC1770BeA7afA4eDe'

const pkpPublicKey = "0x0460579cb0d4bb4846ba43a001e7ec6c42e4db62f3b9c40358df31392e90b24952217c60c945c434dfb68bfc1e5b7cd89b41d1180bdd12b76a9f1d2f82b6d0d6db"
const pkpCompressedPublicKey = "0x0360579cb0d4bb4846ba43a001e7ec6c42e4db62f3b9c40358df31392e90b24952"
const pkpCosmosAddress = 'cosmos1y6nj302f63xanqvmkyx8acc2cq2xsqlwmzfzup'
const pkpEthAddress = "0x7Fd02EEDaE344ecdC95b53086d537bD259c713fb"

const pkpCosmosPubKey = [
  3, 96, 87, 156, 176, 212, 187, 72,
  70, 186, 67, 160, 1, 231, 236, 108,
  66, 228, 219, 98, 243, 185, 196, 3,
  88, 223, 49, 57, 46, 144, 178, 73,
  82
]

// check making a PKP Cosmos address from a PKP hex public key
const cosmosPrivKeyToEthAddress = async (privateKey: string) => {
  const privkey = fromHex(privateKey);
  const keypair = await Secp256k1.makeKeypair(privkey);
  toHex(keypair.pubkey) // 04b9e72dfd423bcf95b3801ac93f4392be5ff22143f9980eb78b3a860c4843bfd04829ae61cdba4b3b1978ac5fc64f5cc2f4350e35a108a9c9a92a81200a60cd64

  const compressed = Secp256k1.compressPubkey(keypair.pubkey);
  toHex(compressed) // 02b9e72dfd423bcf95b3801ac93f4392be5ff22143f9980eb78b3a860c4843bfd0

  const address = `0x${toHex(keccak256(keypair.pubkey.slice(1)).slice(-20))}`; // 0x71cb05ee1b1f506ff321da3dac38f25c0c9ce6e1
  return address;
}

console.log('cosmosPrivKeyToEthAddress', cosmosPrivKeyToEthAddress('1da6847600b0ee25e9ad9a52abbd786dd2502fa4005dd5af9310b7cc7a3b25db'));

async function testEthereumKeyToCosmos() {
  const address = pkpPubKeyToCosmosAddress('0x04507302fc8404fe81260ed233a2d79f209f6789948b4fb31811fe9099bd0459ec8d7c893d10b65c8dd72a296084e8729dfeb13265c3d33d6b6fd6bad92616efad')
  console.log('address', address)
}

// console.log('testEthereumKeyToCosmos', testEthereumKeyToCosmos())


async function chrisDerivation(originalPubKey: string) {
  let cleanedPubKey = originalPubKey;
  if (originalPubKey.startsWith('0x')) {
    cleanedPubKey = originalPubKey.slice(2);
  }
  let pubkey: any = secp256k1.publicKeyConvert(
    LitJsSdk.uint8arrayFromString(cleanedPubKey, "base16"),
    true
  );
  console.log(
    "compressed pubkey: ",
    LitJsSdk.uint8arrayToString(pubkey, "base16")
  );
  pubkey = LitJsSdk.uint8arrayToString(pubkey, "base64");
  console.log("pubkey base64: ", pubkey);

  pubkey = {
    type: "tendermint/PubKeySecp256k1",
    value: pubkey, //"A08EGB7ro1ORuFhjOnZcSgwYlpe0DSFjVNUIkNNQxwKQ",
  };

  const addressChainA = pubkeyToAddress(pubkey, "cosmos");
  console.log("addressChainA: ", addressChainA);
}

console.log('chrisDerivation', chrisDerivation(pkpOwnerPubKey))