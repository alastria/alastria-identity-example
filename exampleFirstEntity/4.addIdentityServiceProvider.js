const { transactionFactory, UserIdentity } = require('alastria-identity-lib')
const Web3 = require('web3')
const fs = require('fs')
const keythereum = require('keythereum')

const rawdata = fs.readFileSync('../configuration.json')
const configData = JSON.parse(rawdata)

const keyDataAdmin = fs.readFileSync(
  '../keystores/firstIdentity-643266eb3105f4bf8b4f4fec50886e453f0da9ad.json'
)
const keystoreDataAdmin = JSON.parse(keyDataAdmin)

// Init your blockchain provider
const myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

const adminKeyStore = keystoreDataAdmin

let adminPrivateKey
try {
  adminPrivateKey = keythereum.recover(
    configData.addressPassword,
    adminKeyStore
  )
} catch (error) {
  console.log('ERROR: ', error)
  process.exit(1)
}

const adminIdentity = new UserIdentity(
  web3,
  `0x${adminKeyStore.address}`,
  adminPrivateKey
)

// Im not sure if this is needed
async function unlockAccount() {
  const unlockedAccount = await web3.eth.personal.unlockAccount(
    adminIdentity.address,
    configData.addressPassword,
    500
  )
  console.log('Account unlocked:', unlockedAccount)
  return unlockedAccount
}

async function mainAdd() {
  unlockAccount()
  console.log(
    '\n ------ Example of adding the entity1 like a Service Provider ------ \n'
  )
  const transaction = await transactionFactory.identityManager.addIdentityServiceProvider(
    web3,
    configData.didEntity1
  )
  const getKnownTx = await adminIdentity.getKnownTransaction(transaction)
  console.log('The transaction bytes data is: ', getKnownTx)
  web3.eth
    .sendSignedTransaction(getKnownTx)
    .on('transactionHash', function (hash) {
      console.log('HASH: ', hash)
    })
    .on('receipt', function (receipt) {
      console.log('RECEIPT: ', receipt)
    })
    .on('error', function (error) {
      console.error(error)
      process.exit(1)
    })
  // If this is a revert, probably this Subject (address) is already a SP
}

mainAdd()
