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
let iss = configData.didSubject1
const signedAT = configDataSignedObjects.signedAT
const exp = Math.round(Date.now() / 1000) + 600 // 10 min = 600 seconds
const nbf = Math.round(Date.now() / 1000) - 600 // 10 min before
const kid = iss + '#keys-1' //header.KID
const jwk = configData.subject1Pubk //header.JWK
const context = configData.context
let jti = ''
const jtiVariableLength = 20 //length of the variable part of the jti
// IAT does not need to be passed, the library calculates it.
const type = ['US211'] // the type "AlastriaSession" is setted in the library

//Generating a random JTI
for (let i = 0; i < jtiVariableLength; i++) {
  jti += randomCharacters.charAt(
    Math.floor(Math.random() * randomCharacters.length)
  )
}
jti = 'nameEntity/alastria/alastria-session/' + jti
// Ending DATA reading/calculating
// **************************************************************************************************

//Creating Alastria Session
console.log('\t 1 - Creating Alastria Session (AS)\n')
const alastriaSession = tokensFactory.tokens.createAlastriaSession(
  context,
  iss,
  kid,
  signedAT,
  exp,
  type,
  jwk,
  nbf,
  jti
)
console.log('\nThe Alastria Session (AS) is:\n', alastriaSession)

// Signing the AlastriaSession
console.log('\t 2 - Signing the Alastria Session (AS)\n')
const signedAS = tokensFactory.tokens.signJWT(
  alastriaSession,
  subject1PrivateKey
)
console.log('\nThe Alastria Session (AS) signed is: \n', signedAS)

// Validating the AlastriaSession
console.log('\t 3 - Validating the Alastria Session (AS)\n')
tests.sessions.validateSession(signedAS)
