const { transactionFactory, UserIdentity } = require('alastria-identity-lib')
const Web3 = require('web3')
const fs = require('fs')
const keythereum = require('keythereum')

const rawdata = fs.readFileSync('../configuration.json')
const configData = JSON.parse(rawdata)

const keyDataEntity1 = fs.readFileSync(
  '../keystores/entity1-a9728125c573924b2b1ad6a8a8cd9bf6858ced49.json'
)
const keystoreDataEntity1 = JSON.parse(keyDataEntity1)

// Init your blockchain provider
const myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

const entity1Keystore = keystoreDataEntity1

let entity1PrivateKey
try {
  entity1PrivateKey = keythereum.recover(
    configData.addressPassword,
    entity1Keystore
  )
} catch (error) {
  console.error('ERROR: ', error)
  process.exit(1)
}

const entity1Identity = new UserIdentity(
  web3,
  `0x${entity1Keystore.address}`,
  entity1PrivateKey
)

async function main() {
  console.log('\n ------ Example of asking for isIdentityIssuer ------ \n')
  const isIssuer = await transactionFactory.identityManager.isIdentityIssuer(
    web3,
    configData.didEntity3
  )
  console.log('isIssuerTransaction', isIssuer)
  web3.eth.call(isIssuer).then((isIssuerStatus) => {
    const result = web3.eth.abi.decodeParameter('bool', isIssuerStatus)
    console.log('isIssuer? ----->', result)
  })
}

main()
