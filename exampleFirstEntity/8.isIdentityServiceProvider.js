const { transactionFactory, UserIdentity } = require('alastria-identity-lib')
const Web3 = require('web3')
const fs = require('fs')
const keythereum = require('keythereum')

const rawdata = fs.readFileSync('../configuration.json')
const configData = JSON.parse(rawdata)

const keyDataAdmin = fs.readFileSync(
  '../keystores/admin-6e3976aeaa3a59e4af51783cc46ee0ffabc5dc11.json'
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

async function main() {
  unlockAccount()
  console.log(
    '\n ------ Example of asking for isIdentityServiceProvider ------ \n'
  )
  const isServiceProvider = await transactionFactory.identityManager.isIdentityServiceProvider(
    web3,
    configData.didEntity1
  )
  console.log('isServiceProviderTransaction', isServiceProvider)
  web3.eth.call(isServiceProvider).then((isServiceProviderStatus) => {
    const result = web3.eth.abi.decodeParameter('bool', isServiceProviderStatus)
    console.log('isServiceProvider? ----->', result)
  })
}

main()
