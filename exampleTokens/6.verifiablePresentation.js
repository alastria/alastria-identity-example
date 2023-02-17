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

//Preparing subject1 keystore (privateKey) to sign Verifiable Presentation
const keyDataSubject1 = fs.readFileSync(
    '../keystores/subject1-806bc0d7a47b890383a831634bcb92dd4030b092.json'
  )
  const subject1Keystore = JSON.parse(keyDataSubject1)
  let subject1PrivateKey
  try {
    subject1PrivateKey = keythereum.recover(configData.addressPassword, subject1Keystore)
  } catch (error) {
    console.error('ERROR: ', error)
    process.exit(1)
  }

// **************************************************************************************************
// Starting reading/calculating DATA declared in configuration.json used to create the Alastria Token
const randomCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
const iss = configData.didSubject1
const aud = configData.didEntity1
const exp = Math.round(Date.now() / 1000) + 86400 // 1 day = 86400 seconds
const nbf = Math.round(Date.now() / 1000) - 86400 // 1 day before 
const kid = iss + "#keys-1" //header.KID presentation
const jwk = configData.subject1Pubk
const procUrl = configData.procUrl
const procHash = configData.procHash
const signVC = configDataSignedObjects.signedCredential
const context = []
const type = []
let jti = "" 
const jtiVariableLength = 20 //length of the variable part of the jti
// IAT does not need to be passed, the library calculates it.

//Generating a random JTI from presentation
for (let i = 0; i < jtiVariableLength; i++) {
    jti += randomCharacters.charAt(Math.floor(Math.random() * randomCharacters.length));
}
jti = "nameEntity/alastria/verifiable-presentation/" + jti

// Init your Blockchain provider
const myBlockchainServiceIp = configData.nodeUrl
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

// Ending DATA reading/calculating
// **************************************************************************************************

//Creating Verifiable Presentation 
console.log('\t 3 - Creating Verifiable Presentation (VP)\n')
const verifiablePresentation = tokensFactory.tokens.createPresentation(
  iss,
  aud,
  context,
  signVC,
  procUrl,
  procHash,
  type,
  kid,
  jwk,
  exp,
  nbf,
  jti
)
console.log('\nThe Verifiable Presentation (VP) is: \n', verifiablePresentation)

// Signing the Verifiable Presentation
console.log('\t 2 - Signing the Verifiable Presentation (VP)\n')
const signedVP = tokensFactory.tokens.signJWT(verifiablePresentation, subject1PrivateKey)
console.log('\nThe presentation is: ', signedVP)

// Validating the Verifiable Presentation
console.log('\t 3 - Validating the Verifiable Presentation (VP)\n')
tests.presentations.validatePresentation(signedVP)

// Creating Issuer PSMHash of the Verifiable Presentation
console.log('\t 4 - Creating Issuer PSMHash of the Verifiable Credential\n')
const issuerPSMHash = tokensFactory.tokens.PSMHash(
  web3,
  signedVP,
  iss
)
console.log('\nThe Issuer PSMHash of the Verifiable Presentation is:', issuerPSMHash)

// Creating Receiver PSMHash of the Verifiable Presentation
console.log('\t 5 - Creating Subject PSMHash of the Verifiable Credential\n')
const subjectPSMHash = tokensFactory.tokens.PSMHash(
  web3,
  signedVP,
  aud
)
console.log('\nThe Receiver PSMHash of the Verifiable Presentation is:', subjectPSMHash)
