const {
  transactionFactory,
  UserIdentity,
  tokensFactory
} = require('alastria-identity-lib')
const Web3 = require('web3')
const fs = require('fs')
const keythereum = require('keythereum')

const rawdata = fs.readFileSync('../configuration.json')
const configData = JSON.parse(rawdata)

const keyDataEntity1 = fs.readFileSync(
  '../keystores/entity1-a9728125c573924b2b1ad6a8a8cd9bf6858ced49.json'
)
const keystoreDataEntity1 = JSON.parse(keyDataEntity1)
const keyDataSubject1 = fs.readFileSync(
  '../keystores/subject1-806bc0d7a47b890383a831634bcb92dd4030b092.json'
)
const keystoreDataSubject1 = JSON.parse(keyDataSubject1)

// Init your blockchain provider
const myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))
// ------------------------------------------------------------------------------
console.log('\n ------ Preparing Subject1 identity ------ \n')

// Some fake data to test

const entity1KeyStore = keystoreDataEntity1

let entity1PrivateKey
try {
  entity1PrivateKey = keythereum.recover(
    configData.addressPassword,
    entity1KeyStore
  )
} catch (error) {
  console.log('ERROR: ', error)
}

const subject1KeyStore = keystoreDataSubject1

let subject1PrivateKey
try {
  subject1PrivateKey = keythereum.recover(
    configData.addressPassword,
    subject1KeyStore
  )
} catch (error) {
  console.log('ERROR: ', error)
}

const subject1Identity = new UserIdentity(
  web3,
  `0x${subject1KeyStore.address}`,
  subject1PrivateKey
)

console.log('\n ------ Creating credential ------ \n')

const jti = configData.jti
const kidCredential = configData.kidCredential
const subjectAlastriaID = configData.subjectAlastriaID
const didEntity1 = configData.didEntity1
const didSubject1 = configData.didSubject1
const context = configData.context
const tokenExpTime = configData.tokenExpTime
const tokenActivationDate = configData.tokenActivationDate

// Credential Map (key-->value)
const credentialSubject = {}
const credentialKey = configData.credentialKey
const credentialValue = configData.credentialValue
credentialSubject[credentialKey] = credentialValue
const levelOfAssuranceBasic = 1
credentialSubject.levelOfAssurance = levelOfAssuranceBasic
const uri = configData.uri

// End fake data to test

const credential = tokensFactory.tokens.createCredential(
  kidCredential,
  didEntity1,
  context,
  credentialSubject,
  subjectAlastriaID,
  tokenExpTime,
  tokenActivationDate,
  jti
)
console.log('The credential1 is: ', credential)

const signedJWTCredential = tokensFactory.tokens.signJWT(
  credential,
  entity1PrivateKey
)
console.log('The signed token is: ', signedJWTCredential)

const subjectCredentialHash = tokensFactory.tokens.PSMHash(
  web3,
  signedJWTCredential,
  didSubject1
)
console.log('The Subject1 PSMHash is ', subjectCredentialHash)
fs.writeFileSync(
  `./PSMHashSubject1.json`,
  JSON.stringify({ psmhash: subjectCredentialHash, jwt: signedJWTCredential })
)

function addSubjectCredential() {
  const subjectCredential = transactionFactory.credentialRegistry.addSubjectCredential(
    web3,
    subjectCredentialHash,
    uri
  )
  console.log('(addSubjectCredential)The transaction is: ', subjectCredential)
  return subjectCredential
}

function sendSigned(subjectCredentialSigned) {
  return new Promise((resolve, reject) => {
    // web3 default subject address
    web3.eth
      .sendSignedTransaction(subjectCredentialSigned)
      .on('transactionHash', function (hash) {
        console.log('HASH: ', hash)
      })
      .on('receipt', (receipt) => {
        resolve(receipt)
      })
      .on('error', (error) => {
        console.log('Error------>', error)
        reject(error)
      })
  })
}

async function main() {
  const resultSubjectCredential = await addSubjectCredential()

  const subjectCredentialSigned = await subject1Identity.getKnownTransaction(
    resultSubjectCredential
  )
  console.log(
    '(addSubjectCredential)The transaction bytes data is: ',
    subjectCredentialSigned
  )
  sendSigned(subjectCredentialSigned).then((receipt) => {
    console.log('RECEIPT:', receipt)
    const subjectCredentialTransaction = transactionFactory.credentialRegistry.getSubjectCredentialStatus(
      web3,
      configData.didSubject1,
      subjectCredentialHash
    )
    web3.eth
      .call(subjectCredentialTransaction)
      .then((SubjectCredentialStatus) => {
        const result = web3.eth.abi.decodeParameters(
          ['bool', 'uint8'],
          SubjectCredentialStatus
        )
        const credentialStatus = {
          exists: result[0],
          status: result[1]
        }
        console.log('(SubjectCredentialStatus) -----> ', credentialStatus)
      })
  })
}
main()
