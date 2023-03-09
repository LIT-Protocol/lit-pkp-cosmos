<div align="center">
<h1>Lit Protocol PKP/Cosmos</h1>
<img src="https://i.ibb.co/p2xfzK1/Screenshot-2022-11-15-at-09-56-57.png">
<br/>
<a href="https://twitter.com/LitProtocol"><img src="https://img.shields.io/twitter/follow/litprotocol?label=Follow&style=social"/></a>
<br/>
<br/>
A small complimentary package for CosmJS that allows PKPs to sign and send transactions on the Cosmos Network.
</div>

### Install:

```
npm install lit-pkp-cosmos
```

```
yarn add lit-pkp-cosmos
```

### Usage:

Instantiate a signer with the PKP public key, a valid auth sig of the owning wallet, and an RPC for the Cosmos Network.

  ```
  const pkpCosmosSigner = await SigningStargateClientWithLit.createClient(
    pkpPubKey, // uncompressed public key
    pkpOwnerAuthSig, // authSig of the owning party
    rpc
  );
```

[An introduction to Lit Actions and PKPs](https://developer.litprotocol.com/coreConcepts/LitActionsAndPKPs/intro)

[Mint PKPs here](https://explorer.litprotocol.com/)

<br>
To use, pass a valid Cosmos address, an amount, and fee.  The fee must be hardcoded since the transactions cannot be simulated with PKPs.

```
  const txRes = await pkpCosmosSigner.sendTokens(
    recipientAddress
    [{denom: "uatom", amount: "100000"}],
    {
      amount: [{denom: "uatom", amount: "1000"}],
      gas: "100000",
    }
  );
  
  console.log('txRes', txRes)
```

[CosmJS tutorial](https://tutorials.cosmos.network/tutorials/7-cosmjs/)

[CosmJS on Github](https://github.com/cosmos/cosmjs)

