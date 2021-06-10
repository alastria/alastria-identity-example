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

// We have Entity1 which is an entity with both roles: Issuer (required) and Service Provider (not required).
// You get its private key and instantiate its UserIdentity
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

// We have Subject2 which is a person with an identity wallet. You get its private key and instantiate its UserIdentity
// This step should be done in the private Wallet.
const keyDataSubject2 = fs.readFileSync(
  '../keystores/subject2-6e3976aeaa3a59e4af51783cc46ee0ffabc5dc11.json'
)
const subject2Keystore = JSON.parse(keyDataSubject2)
let subject2PrivateKey
try {
  subject2PrivateKey = keythereum.recover(
    configData.addressPassword,
    subject2Keystore
  )
} catch (error) {
  console.error('ERROR: ', error)
  process.exit(1)
}
const subject2Identity = new UserIdentity(
  web3,
  `0x${subject2Keystore.address}`,
  subject2PrivateKey
)

console.log(
  '\n ------ Example of prepare Alastria ID, addKey and createAlastrisID necessary to have an Alastria ID ------ \n'
)

function preparedAlastriaId() {
  const preparedId = transactionFactory.identityManager.prepareAlastriaID(
    web3,
    `0x${subject2Keystore.address}`
  )
  return preparedId
}

function createAlastriaId() {
  const txCreateAlastriaID = transactionFactory.identityManager.createAlastriaIdentity(
    web3,
    configData.subject2Pubk.substr(2)
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

  // The subject, from the wallet, should build the tx createAlastriaId and sign it
  const createResult = await createAlastriaId()
  const signedCreateTransaction = await subject2Identity.getKnownTransaction(
    createResult
  )

  // Then, the subject, also from the wallet should build an AIC wich contains the signed AT, the signedTx and the Subject Public Key
  const aic = tokensFactory.tokens.createAIC(
    [],
    [],
    signedCreateTransaction,
    signedAT,
    configData.subject2Pubk
  )
  const signedAIC = tokensFactory.tokens.signJWT(aic, subject2PrivateKey)
  console.log('\tsignedAIC: \n', signedAIC)

  // Then, Entity1 receive the AIC. It should decode it and verify the signature with the public key.
  // It can extract from the AIC all the necessary data for the next steps:
  // wallet address (from public key ir signst tx), subject public key, the tx which is signed by the subject and the signed AT

  // Below, it should build the tx prepareAlastriaId and sign it
  const prepareResult = await preparedAlastriaId()
  const signedPreparedTransaction = await entity1Identity.getKnownTransaction(
    prepareResult
  )

  // At the end, Entity1 should send both tx to the blockchain as it follows:
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
                [`0x${subject2Keystore.address}`]
              )
            })
            .then((AlastriaIdentity) => {
              console.log(
                `alastriaProxyAddress: 0x${AlastriaIdentity.slice(26)}`
              )
              configData.subject2 = `0x${AlastriaIdentity.slice(26)}`
              fs.writeFileSync(
                '../configuration.json',
                JSON.stringify(configData, null, 4)
              )
              const alastriaDID = tokensFactory.tokens.createDID(
                configData.network,
                AlastriaIdentity.slice(26),
                configData.networkId
              )
              configData.didSubject2 = alastriaDID
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
