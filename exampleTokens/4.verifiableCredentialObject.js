const { tokensFactory } = require('alastria-identity-lib')
const { tests } = require('alastria-identity-JSON-objects/tests')
const fs = require('fs')
const Web3 = require('web3')
const keythereum = require('keythereum')

//Preparing to read configuration.json
const rawdata = fs.readFileSync('../configuration.json')
const configData = JSON.parse(rawdata)

const rawDataSignedObjects = fs.readFileSync('./SignedObjects.json')
const configDataSignedObjects = JSON.parse(rawDataSignedObjects)

//FirstIdentity = Entity1
const keyDataFirstIdentity = fs.readFileSync(
    '../keystores/firstIdentity-643266eb3105f4bf8b4f4fec50886e453f0da9ad.json'
  )
  const keystoreDataFirstIdentity = JSON.parse(keyDataFirstIdentity)
  
  let firstIdentityPrivateKey
  try {
    firstIdentityPrivateKey = keythereum.recover(configData.addressPassword, keystoreDataFirstIdentity)
  } catch (error) {
    console.error('ERROR: ', error)
    process.exit(1)
  }
// **************************************************************************************************
// Starting reading/calculating DATA declared in configuration.json used to create the Alastria Token
const randomCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
const iss = configData.didEntity1
const sub = configData.didSubject1
const exp = Math.round(Date.now() / 1000) + 86400 // 1 day = 86400 seconds
const nbf = Math.round(Date.now() / 1000) - 86400 // 1 day before 
const kid = iss + "#keys-1" //header.KID
const jwk = configData.firstIdentityPubk //header.JWK
let jti = "" 
const jtiVariableLength = 20 //length of the variable part of the jti
// IAT does not need to be passed, the library calculates it.
const type = ["DrivingLicense"]
const context = []

//Generating a random JTI
for (let i = 0; i < jtiVariableLength; i++) {
    jti += randomCharacters.charAt(Math.floor(Math.random() * randomCharacters.length));
}
jti = "nameEntity/alastria/verifiable-credential/" + jti

// Init your Blockchain provider
const myBlockchainServiceIp = configData.nodeUrl
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

// Multivalued Credential Map (key-->value)
const credentialSubject = {}
const credentialKey = configData.credentialKeyFather
const credentialValue = configData.credentialValueFather
const credentialSubKey1 = configData.credentialSubKey1
const credentialSubKey2 = configData.credentialSubKey2
const credentialSubKey3 = configData.credentialSubKey3
const credentialSubKey4 = configData.credentialSubKey4
const credentialSubValue1 = configData.credentialSubValue1
const credentialSubValue2 = configData.credentialSubValue2
const credentialSubValue3 = configData.credentialSubValue3
const credentialSubValue4 = configData.credentialSubValue4
credentialSubject[credentialKey] = credentialValue
credentialSubject[credentialKey][credentialSubKey1] = credentialSubValue1
credentialSubject[credentialKey][credentialSubKey2] = credentialSubValue2
credentialSubject[credentialKey][credentialSubKey3] = credentialSubValue3
credentialSubject[credentialKey][credentialSubKey4] = credentialSubValue4
credentialSubject.levelOfAssurance = 1
// Ending DATA reading/calculating
// **************************************************************************************************

console.log('\t 1 - Creating Verifiable Credential (VC)\n')
const verifiableCredential = tokensFactory.tokens.createCredential(
  iss,
  context,
  credentialSubject,
  kid,
  sub,
  exp,
  nbf,
  jti,
  jwk,
  type
)
console.log('\nThe Verifiable Credential (VC) is: \n', verifiableCredential)

// Signing the VerifiableCredential
console.log('\t 2 - Signing the Verifiable Credential (VC)\n')
const signedVC = tokensFactory.tokens.signJWT(verifiableCredential, firstIdentityPrivateKey)
console.log('\nThe Verifiable Credential (VC) signed is: \n', signedVC)

// Validating the VerifiableCredential
console.log('\t 3 - Validating the Verifiable Credential (VC)\n')
tests.credentials.validateCredential(signedVC)

// Creating Issuer PSMHash of the Verifiable Credential
console.log('\t 4 - Creating Issuer PSMHash of the Verifiable Credential\n')
const issuerPSMHash = tokensFactory.tokens.PSMHash(
  web3,
  signedVC,
  iss
)
console.log('\nThe Issuer PSMHash of the Verifiable Credential is:', issuerPSMHash)

// Creating Subject PSMHash of the Verifiable Credential
console.log('\t 5 - Creating Subject PSMHash of the Verifiable Credential\n')
const subjectPSMHash = tokensFactory.tokens.PSMHash(
  web3,
  signedVC,
  sub
)
console.log('\nThe Subject PSMHash of the Verifiable Credential is:', subjectPSMHash)

configDataSignedObjects.signedCredential = signedVC
fs.writeFileSync(
    './SignedObjects.json',
    JSON.stringify(configDataSignedObjects, null, 4)
  )