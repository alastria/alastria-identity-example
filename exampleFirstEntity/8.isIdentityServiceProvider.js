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
  console.error('ERROR: ', error)
  process.exit(1)
}

const firstIdentityIdentity = new UserIdentity(
  web3,
  `0x${firstIdentityKeyStore.address}`,
  firstIdentityPrivateKey
)

async function main() {
  console.log(
    '\n ------ Example of asking for isIdentityServiceProvider ------ \n'
  )
  const isServiceProvider =
    await transactionFactory.identityManager.isIdentityServiceProvider(
      web3,
      configData.didEntity1
    )
  console.log('isServiceProviderTransaction', isServiceProvider)
  web3.eth
    .call(isServiceProvider)
    .then((isServiceProviderStatus) => {
      const result = web3.eth.abi.decodeParameter(
        'bool',
        isServiceProviderStatus
      )
      console.log('isServiceProvider? ----->', result)
    })
    .catch((error) => {
      console.error('Error -----> ', error)
      process.exit(1)
    })
}

main()
