const { transactionFactory, UserIdentity, tokensFactory } = require('alastria-identity-lib')
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

const Web3 = require('web3')
const myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

console.log('\n ------ Preparing Entity1 identity ------ \n')

// Some fake data to test
//PREPARING ENTITY1 IDENTITY
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

//PREPARING SUBJECT1 IDENTITY
const subject1KeyStore = keystoreDataSubject1

let subject1PrivateKey
try {
  subject1PrivateKey = keythereum.recover(
    configData.addressPassword,
    subject1KeyStore
  )
} catch (error) {
  console.error('ERROR: ', error)
}

const subject1Identity = new UserIdentity(
  web3,
  `0x${subject1KeyStore.address}`,
  subject1PrivateKey
)

//IDENTITY CHECK FOR ENTITY1 AND FOR SUBJECT1
if (configData.didEntity1 === undefined) {
    console.error('You must create an Alastria ID for entity1')
    process.exit(1)
  }
  if (configData.didSubject1 === undefined) {
    console.error('You must create an Alastria ID for Subject1')
    process.exit(1)
  }

//CREDENTIAL DATA
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
credentialSubject.levelOfAssurance = 'low'

//BUILD CREDENTIAL WITH tokensFactory LIBRARY 
const credential = tokensFactory.tokens.createCredential(
  didEntity1,
  context,
  credentialSubject,
  kidCredential,
  subjectAlastriaID,
  tokenExpTime,
  tokenActivationDate,
  jti
)
console.log('The credential1 is: ', credential)

//ENTITY1 SIGN CREDENTIAL
const signedJWTCredential = tokensFactory.tokens.signJWT(
  credential,
  entity1PrivateKey
)
console.log('The signed token is: ', signedJWTCredential)

//BUILD CREDENTIAL PSMHASHES 
const issuerCredentialHash = tokensFactory.tokens.PSMHash(
  web3,
  signedJWTCredential,
  didEntity1
)
const subjectCredentialHash = tokensFactory.tokens.PSMHash(
    web3,
    signedJWTCredential,
    didSubject1
  )

//BUILD TRANSACTION updateCredentialStatus WITH transactionFactory LIBRARY
const updateCredentialStatus = transactionFactory.credentialRegistry.updateCredentialStatus(
  web3,
  issuerCredentialHash,
  configData.updateIssuerCredentialTo
)

async function main() {
  //SEND TRANSACTION 
  const updateCredStat = await entity1Identity.getKnownTransaction(
    updateCredentialStatus
  )
  console.log(
    '(updateCredentialStatus)The transaction bytes data is: ',
    updateCredStat
  )
  //BUILD getIssuerCredentialStatus TRANSACTION WITH transactionFactory LIBRARY
  web3.eth.sendSignedTransaction(updateCredStat).then(() => {
    const issuerCredentialTransaction = transactionFactory.credentialRegistry.getIssuerCredentialStatus(
      web3,
      configData.didEntity1,
      issuerCredentialHash
    )
    web3.eth
      .call(issuerCredentialTransaction)
      .then((IssuerCredentialStatus) => {
        const result = web3.eth.abi.decodeParameters(
          ['bool', 'uint8'],
          IssuerCredentialStatus
        )
        const credentialStatusIssuer = {
          exists: result[0],
          status: result[1]
        }
        console.log('(IssuerCredentialStatus) -----> ', credentialStatusIssuer)
      })
  })
  //BUILD getSubjectCredentialStatus TRANSACTION WITH transactionFactory LIBRARY  
  const subjectCredentialTransaction = transactionFactory.credentialRegistry.getSubjectCredentialStatus(
      web3,
      didSubject1,
      subjectCredentialHash
    )
    web3.eth
      .call(subjectCredentialTransaction)
      .then((SubjectCredentialStatus) => {
        const result = web3.eth.abi.decodeParameters(
          ['bool', 'uint8'],
          SubjectCredentialStatus
        )
        const credentialStatusSubject = {
          exists: result[0],
          status: result[1]
        }
        console.log('(SubjectCredentialStatus) -----> ', credentialStatusSubject)
      })
    }

main()
