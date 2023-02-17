const { tokensFactory } = require('alastria-identity-lib')
const { tests } = require('alastria-identity-JSON-objects/tests')
const fs = require('fs')
const keythereum = require('keythereum')

//Preparing to read configuration.json
const rawdata = fs.readFileSync('../configuration.json')
const configData = JSON.parse(rawdata)

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

// Starting reading/calculating DATA declared in configuration.json used to create the Alastria Token
const randomCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
const iss = configData.didEntity1
const cbu = configData.callbackURL
const exp = Math.round(Date.now() / 1000) + 86400 // 1 day = 86400 seconds
const nbf = Math.round(Date.now() / 1000) - 86400 // 1 day before 
const kid = iss + "#keys-1" //header.KID
const jwk = configData.firstIdentityPubk //header.JWK
const procUrl = configData.procUrl
const procHash = configData.procHash
const data = configData.data
const context = []
const type = []
let jti = "" 
const jtiVariableLength = 20 //length of the variable part of the jti
// IAT does not need to be passed, the library calculates it.

//Generating a random JTI
for (let i = 0; i < jtiVariableLength; i++) {
    jti += randomCharacters.charAt(Math.floor(Math.random() * randomCharacters.length));
}
jti = "nameEntity/alastria/presentation-request/" + jti
// Ending DATA reading/calculating

//Creating Presentation Request
console.log('\t 1 - Creating Presentation Request (PR)\n')
const presentationRequest = tokensFactory.tokens.createPresentationRequest(
  iss,
  context,
  procUrl,
  procHash,
  data,
  cbu,
  type,
  kid,
  jwk,
  exp,
  nbf,
  jti
)

// Signing the Presentation Request
console.log('\t 2 - Signing the Presentation Request (PR)\n')
const signedPresentationRequest = tokensFactory.tokens.signJWT(presentationRequest, firstIdentityPrivateKey)
console.log('\nThe presentationRequest is: ', signedPresentationRequest)

// Validating the Presentation Request
console.log('\t 3 - Validating the Presentation Request (PR)\n')
tests.presentationRequests.validatePresentationRequest(signedPresentationRequest)