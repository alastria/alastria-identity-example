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

const entity1KeyStore = keystoreDataEntity1

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

async function mainAddEntity() {
  console.log('\n ------ Example of adding the entity1 like a Entity ------ \n')
  const transactionAddEntity = await transactionFactory.alastriaNameService.addEntity(
    web3,
    configData.didEntity2,
    configData.entityData2.name,
    configData.entityData2.cif,
    configData.entityData2.urlLogo,
    configData.entityData2.urlCreateAID,
    configData.entityData2.urlAOA
  )
  const getKnownTxAddEntity = await entity1Identity.getKnownTransaction(
    transactionAddEntity
  )
  console.log('The transaction bytes data is: ', getKnownTxAddEntity)
  web3.eth
    .sendSignedTransaction(getKnownTxAddEntity)
    .on('transactionHash', function (hashAddEntity) {
      console.log('HASH: ', hashAddEntity)
    })
    .on('receipt', function (receiptAddEntity) {
      console.log('RECEIPT: ', receiptAddEntity)
    })

    .on('error', function (error) {
      console.error(error)
      process.exit(1)
    }) // If this is a revert, probably this Subject (address) is already a SP
}

mainAddEntity()
