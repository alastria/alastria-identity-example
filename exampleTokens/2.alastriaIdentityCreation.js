const { tokensFactory } = require('alastria-identity-lib')
const { tests } = require('alastria-identity-JSON-objects/tests')
const fs = require('fs')
const keythereum = require('keythereum')

//Preparing to read configuration.json
const rawdata = fs.readFileSync('../configuration.json')
const configData = JSON.parse(rawdata)

const rawDataSignedObjects = fs.readFileSync('./SignedObjects.json')
const configDataSignedObjects = JSON.parse(rawDataSignedObjects)

//Preparing subject1 keystore (privateKey)
const keyDataSubject1 = fs.readFileSync(
  '../keystores/subject1-806bc0d7a47b890383a831634bcb92dd4030b092.json'
)
const subject1Keystore = JSON.parse(keyDataSubject1)
let subject1PrivateKey
try {
  subject1PrivateKey = keythereum.recover(
    configData.addressPassword,
    subject1Keystore
  )
} catch (error) {
  console.error('ERROR: ', error)
  process.exit(1)
}

// **************************************************************************************************
// Starting reading/calculating DATA declared in configuration.json used to create the Alastria Token
const randomCharacters =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
const iss = configData.subject1Pubk
const signedAT = configDataSignedObjects.signedAT
const exp = Math.round(Date.now() / 1000) + 600 // 10 min = 600 seconds
const nbf = Math.round(Date.now() / 1000) - 600 // 10 min before
// THIS SHOULD BE OTHER IDENTIFICATION, BECAUSE AT THIS POINT WE DONT HAVE THE DID OF THE SUBJECT
const kid = 'did:ala:quor:redT:0000000000000000000000000000000000000000#keys-1' //header.KID
const signedCreateAlastriaIDTX = configData.signedTxCreateAlastriaID
const jwk = configData.subject1Pubk //header.JWK
const context = configData.context
const type = ['US12']
let jti = ''
const jtiVariableLength = 20 //length of the variable part of the jti
// IAT does not need to be passed, the library calculates it.
const iat = Math.round(Date.now() / 1000)

//Generating a random JTI
for (let i = 0; i < jtiVariableLength; i++) {
  jti += randomCharacters.charAt(
    Math.floor(Math.random() * randomCharacters.length)
  )
}
jti = 'nameEntity/alastria/alastria-identity-creation/' + jti
// Ending DATA reading/calculating
// **************************************************************************************************

//Creating Alastria Identity Creation
console.log('\t 1 - Creating Alastria Identity Creation (AIC)\n')

const alastriaIdentityCreation = tokensFactory.tokens.createAIC(
  context,
  type,
  signedCreateAlastriaIDTX,
  signedAT,
  jwk,
  kid,
  jwk,
  jti,
  exp,
  nbf
)
console.log(
  '\n The Alastria Identity Creation (AIC) is:',
  alastriaIdentityCreation
)

// Signing the AlastriaToken
console.log('\t 2 - Signing the Alastria Identity Creation (AIC)\n')
const signedAIC = tokensFactory.tokens.signJWT(
  alastriaIdentityCreation,
  subject1PrivateKey
)
console.log('\nThe Alastria Identity Creation (AIC) signed is: \n', signedAIC)

// Validating the AlastriaIdentityCreation
console.log('\t 3 - Validating the Alastria Identity Creation (AIC)\n')
tests.alastriaIdCreations.validateAlastriaIdCreation(signedAIC)
