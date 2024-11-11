const { transactionFactory, UserIdentity } = require('alastria-identity-lib')
const fs = require('fs')
const keythereum = require('keythereum')
const rawdata = fs.readFileSync('../configuration.json')
const configData = JSON.parse(rawdata)

const issuerHashData = fs.readFileSync(`./PSMHashEntity1.json`)
const credentialHash = JSON.parse(issuerHashData)

const Web3 = require('web3')
const myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

const updateCredentialStatus = transactionFactory.credentialRegistry.updateIssuerCredential(
  web3,
  credentialHash.psmhash,
  configData.updateIssuerCredentialTo
)

const keyDataEntity1 = fs.readFileSync(
  '../keystores/entity1-a9728125c573924b2b1ad6a8a8cd9bf6858ced49.json'
)
const keystoreDataEntity1 = JSON.parse(keyDataEntity1)

const entity1Keystore = keystoreDataEntity1

let entity1PrivateKey
try {
  entity1PrivateKey = keythereum.recover(
    configData.addressPassword,
    entity1Keystore
  )
} catch (error) {
  console.error('ERROR: ', error)
}

const entity1Identity = new UserIdentity(
  web3,
  `0x${entity1Keystore.address}`,
  entity1PrivateKey
)

if (configData.didEntity1 === undefined) {
  console.error('You must create an Alastria ID')
  process.exit(1)
}

async function main() {
  const updateCredStat = await entity1Identity.getKnownTransaction(
    updateCredentialStatus
  )
  console.log(
    '(updateCredentialStatus)The transaction bytes data is: ',
    updateCredStat
  )
  web3.eth.sendSignedTransaction(updateCredStat).then(() => {
    const issuerCredentialTransaction = transactionFactory.credentialRegistry.getIssuerCredentialStatus(
      web3,
      configData.didEntity1,
      credentialHash.psmhash
    )
    web3.eth
      .call(issuerCredentialTransaction)
      .then((IssuerCredentialStatus) => {
        const result = web3.eth.abi.decodeParameters(
          ['bool', 'uint8'],
          IssuerCredentialStatus
        )
        const credentialStatus = {
          exists: result[0],
          status: result[1]
        }
        console.log('(IssuerCredentialStatus) -----> ', credentialStatus)
      })
  })
}

main()
