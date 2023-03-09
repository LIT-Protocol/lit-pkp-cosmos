// import { SigningStargateClientWithLit } from "./stargateClientWithLit";
//
// async function runSigningWithLitClient(pubKey: any) {
//   console.log("Sign with Lit");
//   const pkpSigner = await SigningStargateClientWithLit.createClient(
//     pubKey,
//     pkpOwnerAuthSig,
//     rpc
//   );
//   const signedTx = await pkpSigner.sendTokens(
//     keplrAddress,
//     [{denom: "uatom", amount: "100000"}],
//     {
//       amount: [{denom: "uatom", amount: "10000"}],
//       gas: "100000",
//     }
//   );
//   return signedTx;
// }