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
let iss = configData.didEntity1
const gwu = configData.providerURL
const cbu = configData.callbackURL
const ani = configData.networkId
const exp = Math.round(Date.now() / 1000) + 600 // 10 min = 600 seconds
const nbf = Math.round(Date.now() / 1000) - 600 // 10 min before 
let kid = iss + "#keys-1" //header.KID
let jwk = configData.entity1Pubk //header.JWK
let jti = "" 
const jtiVariableLength = 20 //length of the variable part of the jti
// IAT does not need to be passed, the library calculates it.

//Neeed to added in the librery first to Alastria Token artifact
let type = ["US12"] // the type "AlastriaToken" is setted in the library
const context = configData.context
const mfau = configData.mfau

//Generating a random JTI
for (let i = 0; i < jtiVariableLength; i++) {
    jti += randomCharacters.charAt(Math.floor(Math.random() * randomCharacters.length));
}
jti = "nameEntity/alastria/alastria-token/" + jti
// Ending DATA reading/calculating

//Creating Alastria Token
console.log('\t 1 - Creating Alastria Token (AT)\n')
const alastriaToken = tokensFactory.tokens.createAlastriaToken(
  iss,
  gwu,
  cbu,
  ani,
  exp,
  kid,
  jwk,
  nbf,
  jti
)
console.log('\nThe Alastria Token (AT) is: \n', alastriaToken)

// Signing the AlastriaToken
console.log('\t 2 - Signing the Alastria Token (AT)\n')
const signedAT = tokensFactory.tokens.signJWT(alastriaToken, firstIdentityPrivateKey)
console.log('\nThe Alastria Token (AT) signed is: \n', signedAT)

// Validating the AlastriaToken
console.log('\t 3 - Validating the Alastria Token (AT)\n')
tests.tokens.validateToken(signedAT)

//Preparing subject1 keystore (privateKey)
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

// Starting reading/calculating DATA declared in configuration.json used to create the Alastria Token
// THIS SHOULD BE OTHER IDENTIFICATION, BECAUSE AT THIS POINT WE DONT HAVE THE DID OF THE SUBJECT
kid = "did:ala:quor:redT:0000000000000000000000000000000000000000#keys-1" //header.KID
type =["US12"] // the type "AlastriaSession" is setted in the library
jwk = configData.subject1Pubk //header.JWK
let jtiAIC = ""
const signedCreateAlastriaIDTX = configData.signedTxCreateAlastriaID
const iat = Math.round(Date.now() / 1000)
//Generating a random JTI
for (let i = 0; i < jtiVariableLength; i++) {
    jtiAIC += randomCharacters.charAt(Math.floor(Math.random() * randomCharacters.length));
}
jtiAIC = "nameEntity/alastria/alastria-identity-creation/" + jtiAIC
// Ending DATA reading/calculating

//Creating Alastria Identity Creation
console.log('\t 4 - Creating Alastria Identity Creation (AIC)\n')

const alastriaIdentityCreation = tokensFactory.tokens.createAIC(
  context,
  type,
  signedCreateAlastriaIDTX,
  signedAT,
  jwk,
  kid,
  jwk,
  jtiAIC,
  iat,
  exp,
  nbf
)
console.log('\n The Alastria Identity Creation (AIC) is:', alastriaIdentityCreation)

// Signing the AlastriaToken
console.log('\t 5 - Signing the Alastria Identity Creation (AIC)\n')
const signedAIC = tokensFactory.tokens.signJWT(alastriaIdentityCreation, subject1PrivateKey)
console.log('\nThe Alastria Identity Creation (AIC) signed is: \n', signedAIC)

// Validating the AlastriaIdentityCreation
console.log('\t 6 - Validating the Alastria Identity Creation (AIC)\n')
tests.alastriaIdCreations.validateAlastriaIdCreation(signedAIC)
