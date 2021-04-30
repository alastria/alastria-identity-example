const { transactionFactory, UserIdentity } = require('alastria-identity-lib')
const Web3 = require('web3')
const fs = require('fs')
const keythereum = require('keythereum')

const rawdata = fs.readFileSync('../configuration.json')
const configData = JSON.parse(rawdata)

const keyDataFirstIdentity = fs.readFileSync(
  '../keystores/firstIdentity-643266eb3105f4bf8b4f4fec50886e453f0da9ad.json'
)
const keystoreDataFirstIdentity = JSON.parse(keyDataFirstIdentity)

// Init your blockchain provider
const myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

const firstIdentityKeyStore = keystoreDataFirstIdentity

let firstIdentityPrivateKey
try {
  firstIdentityPrivateKey = keythereum.recover(
    configData.addressPassword,
    firstIdentityKeyStore
  )
} catch (error) {
  console.log('ERROR: ', error)
  process.exit(1)
}

const firstIdentityIdentity = new UserIdentity(
  web3,
  `0x${firstIdentityKeyStore.address}`,
  firstIdentityPrivateKey
)

// Im not sure if this is needed
async function unlockAccount() {
  const unlockedAccount = await web3.eth.personal.unlockAccount(
    firstIdentityIdentity.address,
    configData.addressPassword,
    500
  )
  console.log('Account unlocked:', unlockedAccount)
  return unlockedAccount
}

async function mainAdd() {
  unlockAccount()
  console.log('\n ------ Example of adding the entity1 like a Issuer ------ \n')
  const transactionAddIssuer = await transactionFactory.identityManager.addIdentityIssuer(
    web3,
    configData.didEntity1,
    configData.issuerLevel
  )
  const getKnownTxAddIssuer = await firstIdentityIdentity.getKnownTransaction(
    transactionAddIssuer
  )
  console.log('The transaction bytes data is: ', getKnownTxAddIssuer)
  web3.eth
    .sendSignedTransaction(getKnownTxAddIssuer)
    .on('transactionHash', function (hashAddIssuer) {
      console.log('HASH: ', hashAddIssuer)
    })
    .on('receipt', function (receiptAddIssuer) {
      console.log('RECEIPT: ', receiptAddIssuer)
    })

    .on('error', function (error) {
      console.error(error)
      process.exit(1)
    })
  // If this is a revert, probably this Subject (address) is already a SP
}

mainAdd()
