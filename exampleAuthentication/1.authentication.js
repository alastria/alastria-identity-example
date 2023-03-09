const { tokensFactory } = require('alastria-identity-lib')
const fs = require('fs')
const keythereum = require('keythereum')

//Preparing to read configuration.json
const rawdata = fs.readFileSync('../configuration.json')
const configData = JSON.parse(rawdata)

//Preparing entity1 and subject1 keystore (privateKey)
const keyDataEntity1 = fs.readFileSync(
  '../keystores/entity1-a9728125c573924b2b1ad6a8a8cd9bf6858ced49.json'
)
const keystoreDataEntity1 = JSON.parse(keyDataEntity1)
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

const keyDataSubject1 = fs.readFileSync(
  '../keystores/subject1-806bc0d7a47b890383a831634bcb92dd4030b092.json'
)
const keystoreDataSubject1 = JSON.parse(keyDataSubject1)
const subject1Keystore = keystoreDataSubject1
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

// ***********************************************************************************************************************
// Starting reading/calculating DATA declared in configuration.json used to create the Alastria Token and Alastria Session
const randomCharacters =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
//Alastria Token info
const issAT = configData.didEntity1
const gwu = configData.providerURL
const cbu = configData.callbackURL
const exp = Math.round(Date.now() / 1000) + 600 // 10 min = 600 seconds
const nbf = Math.round(Date.now() / 1000) - 600 // 10 min before
const kidAT = issAT + '#keys-1' //header.KID
const jwkAT = configData.entity1Pubk //header.JWK
let jtiAT = ''
const jtiVariableLength = 20 //length of the variable part of the jti

//Generating a random JTI to AT
for (let i = 0; i < jtiVariableLength; i++) {
  jtiAT += randomCharacters.charAt(
    Math.floor(Math.random() * randomCharacters.length)
  )
}
jtiAT = 'nameEntity/alastria/alastria-token/' + jtiAT

//Alastria Session info
const context = configData.context
const issAS = configData.didSubject1
const kidAS = issAS + '#keys-1'
const type = ['US211'] //other info setted in the library
const jwkAS = configData.subject1Pubk
let jtiAS = ''
const mfau = configData.mfau

//Generating a random JTI to AS
for (let i = 0; i < jtiVariableLength; i++) {
  jtiAS += randomCharacters.charAt(
    Math.floor(Math.random() * randomCharacters.length)
  )
}
jtiAS = 'nameEntity/alastria/alastria-session/' + jtiAS
// Ending DATA reading/calculating
// ***********************************************************************************************************************

console.log('\t ------ Example of Authentication ------ \n')

//1 - First the entity creates Alastria Token artifact
console.log('\t 1 - Creating Alastria Token (AT)\n')

const alastriaToken = tokensFactory.tokens.createAlastriaToken(
  context,
  issAT,
  gwu,
  cbu,
  exp,
  kidAT,
  type,
  mfau,
  jwkAT,
  nbf,
  jtiAT
)
console.log('\nThe Alastria token is: \n', alastriaToken)

//2 - The entity sign the Alastria Token
console.log('\t 2 - Signing Alastria Token (AT)\n')
const signedAT = tokensFactory.tokens.signJWT(alastriaToken, entity1PrivateKey)
console.log('\nThe Alastria token signed is: \n', signedAT)

//3 - To other communication channel (QR, Deeplink...) the entity sends to the subject AT artifact
// and the subject with the publicKey of the entity verifies it.
// '04' means uncompressed key (more info at https://github.com/indutny/elliptic/issues/138)
console.log('\t 3 - Subject verifies the Alastria Token (AT)\n')
const verifyAT = tokensFactory.tokens.verifyJWT(
  signedAT,
  '04' + configData.entity1Pubk.substr(2)
)
console.log('\nIs the Alastria Token verified?', verifyAT)

//4 - Subject creates the Alastria Session to respond to the challenge set by the entity.
console.log('\t 4 - Creating Alastria Session (AS)\n')
const alastriaSession = tokensFactory.tokens.createAlastriaSession(
  context,
  issAS,
  kidAS,
  signedAT,
  exp,
  type,
  jwkAS,
  nbf,
  jtiAS
)
console.log('\nThe Alastria session is:\n', alastriaSession)

//5 - The subject sign the Alastria Session
console.log('\t 5 - Signing Alastria Session (AS)\n')
const signedAS = tokensFactory.tokens.signJWT(
  alastriaSession,
  subject1PrivateKey
)
console.log('\nThe Alastria Session signed is:\n', signedAS)

//6 - Answer to the cbu of the AT, the subject sends the AS to the entity
// '04' means uncompressed key (more info at https://github.com/indutny/elliptic/issues/138)
console.log('\t 6 - Entity verifies the Alastria Session (AS)\n')
const verifyAS = tokensFactory.tokens.verifyJWT(
  signedAS,
  '04' + configData.subject1Pubk.substr(2)
)
console.log('\nIs the signedJWT verified?', verifyAS)
