const {
  transactionFactory,
  UserIdentity,
  config,
  tokensFactory
} = require('alastria-identity-lib')
const fs = require('fs')
const Web3 = require('web3')
const keythereum = require('keythereum')

const rawdata = fs.readFileSync('../configuration.json')
const configData = JSON.parse(rawdata)
// Init your blockchain provider
const myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

const keyDataEntity1 = fs.readFileSync(
  '../keystores/entity1-a9728125c573924b2b1ad6a8a8cd9bf6858ced49.json'
)
const entity1KeyStore = JSON.parse(keyDataEntity1)
let entity1PrivateKey
try {
  entity1PrivateKey = keythereum.recover(
    configData.addressPassword,
    entity1KeyStore
  )
} catch (error) {
  console.error('ERROR: ', error)
  process.exit(1)
}
const entity1Identity = new UserIdentity(
  web3,
  `0x${entity1KeyStore.address}`,
  entity1PrivateKey
)

const keyDataEntity3 = fs.readFileSync(
  '../keystores/entity3-de7ab34219563ac50ccc7b51d23b9a61d22a383e.json'
)
const entity3Keystore = JSON.parse(keyDataEntity3)
let entity3PrivateKey
try {
  entity3PrivateKey = keythereum.recover(
    configData.addressPassword,
    entity3Keystore
  )
} catch (error) {
  console.error('ERROR: ', error)
  process.exit(1)
}

const entity3Identity = new UserIdentity(
  web3,
  `0x${entity3Keystore.address}`,
  entity3PrivateKey
)

console.log(
  '\n ------ Example of creating an Alastria ID for a Entity3 with Entity1. ------ \n'
)
// (In this example the Entity1 is not added as service provider or issuer, only is the AlastriaIDentity creation)

function preparedAlastriaId() {
  const preparedId = transactionFactory.identityManager.prepareAlastriaID(
    web3,
    `0x${entity3Keystore.address}`
  )
  return preparedId
}

function createAlastriaId() {
  const txCreateAlastriaID = transactionFactory.identityManager.createAlastriaIdentity(
    web3,
    configData.entity3Pubk.substr(2)
  )
  return txCreateAlastriaID
}

console.log(
  '\n ------ A promise all where prepareAlastriaID and createAlsatriaID transactions are signed and sent ------ \n'
)
async function main() {
  // At the beggining, the Entity1 should create an AT, sign it and send it to the wallet
  const at = tokensFactory.tokens.createAlastriaToken(
    configData.didEntity1,
    configData.providerURL,
    configData.callbackURL,
    configData.networkId,
    configData.tokenExpTime,
    configData.kidCredential,
    configData.entity1Pubk,
    configData.tokenActivationDate,
    configData.jsonTokenId
  )
  const signedAT = tokensFactory.tokens.signJWT(at, entity1PrivateKey)
  console.log('\tsignedAT: \n', signedAT)

  const createResult = await createAlastriaId()
  const signedCreateTransaction = await entity3Identity.getKnownTransaction(
    createResult
  )

  // Then, the entity3, also from the wallet should build an AIC wich contains the signed AT, the signedTx and the entity3 Public Key
  const aic = tokensFactory.tokens.createAIC(
    [],
    [],
    signedCreateTransaction,
    signedAT,
    configData.entity3Pubk
  )
  const signedAIC = tokensFactory.tokens.signJWT(aic, entity3PrivateKey)
  console.log('\tsignedAIC: \n', signedAIC)

  // Then, Entity1 receive the AIC. It should decode it and verify the signature with the public key.
  // It can extract from the AIC all the necessary data for the next steps:
  // wallet address (from public key ir signst tx), entity3 public key, the tx which is signed by the entity3 and the signed AT

  // Below, it should build the tx prepareAlastriaId and sign it
  const prepareResult = await preparedAlastriaId()
  const signedPreparedTransaction = await entity1Identity.getKnownTransaction(
    prepareResult
  )

  // At the end, Entity1 should send both tx (prepareAlastriaId and createAlastriaID, in that order) to the blockchain as it follows:
  console.log('---->signedCreateTransaction<----', signedCreateTransaction)
  web3.eth
    .sendSignedTransaction(signedPreparedTransaction)
    .on('transactionHash', function (hash) {
      console.log('HASH: ', hash)
    })
    .on('receipt', function (receipt) {
      console.log('RECEIPT: ', receipt)
      web3.eth
        .sendSignedTransaction(signedCreateTransaction)
        .on('transactionHash', function (hash) {
          console.log('HASH: ', hash)
        })
        .on('receipt', function (receipt) {
          console.log('RECEIPT: ', receipt)
          web3.eth
            .call({
              to: config.alastriaIdentityManager,
              data: web3.eth.abi.encodeFunctionCall(
                config.contractsAbi.AlastriaIdentityManager.identityKeys,
                [`0x${entity3Keystore.address}`]
              )
            })
            .then((AlastriaIdentity) => {
              console.log(
                `alastriaProxyAddress: 0x${AlastriaIdentity.slice(26)}`
              )
              configData.entity3 = `0x${AlastriaIdentity.slice(26)}`
              fs.writeFileSync(
                '../configuration.json',
                JSON.stringify(configData, null, 4)
              )
              const alastriaDID = tokensFactory.tokens.createDID(
                configData.network,
                AlastriaIdentity.slice(26),
                configData.networkId
              )
              configData.didEntity3 = alastriaDID
              fs.writeFileSync(
                '../configuration.json',
                JSON.stringify(configData, null, 4)
              )
              console.log('the alastria DID is:', alastriaDID)
            })
        })

        .on('error', function (error) {
          console.error(error)
          process.exit(1)
        }) // If a out of gas error, the second parameter is the receipt.
    })

    .on('error', function (error) {
      console.error(error)
      process.exit(1)
    }) // If a out of gas error, the second parameter is the receipt.
}

main()
