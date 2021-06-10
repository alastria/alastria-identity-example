const { tokensFactory } = require('alastria-identity-lib')
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

console.log('\n ------ Example of Authentication ------ \n')

const alastriaToken = tokensFactory.tokens.createAlastriaToken(
  configData.didEntity1,
  configData.providerURL,
  configData.callbackURL,
  configData.networkId,
  configData.tokenExpTime,
  configData.kidCredential,
  configData.entity1Pubk,
  configData.tokenActivationDate,
  configData.jsonTokenId
)
console.log('\tThe Alastria token is: \n', alastriaToken)

// Signing the AlastriaToken
const signedAT = tokensFactory.tokens.signJWT(alastriaToken, entity1PrivateKey)

// '04' means uncompressed key (more info at https://github.com/indutny/elliptic/issues/138)
const verifyAT = tokensFactory.tokens.verifyJWT(
  signedAT,
  '04' + configData.entity1Pubk.substr(2)
)
console.log('\tIs the signedJWT verified?', verifyAT)

const alastriaSession = tokensFactory.tokens.createAlastriaSession(
  configData.context,
  configData.didSubject1,
  configData.subject1Pubk,
  signedAT,
  configData.tokenExpTime,
  configData.tokenActivationDate,
  configData.jsonTokenId
)
console.log('\tThe Alastria session is:\n', alastriaSession)

const signedAS = tokensFactory.tokens.signJWT(
  alastriaSession,
  subject1PrivateKey
)
console.log('\tThe signedAS is:\n', signedAS)

// '04' means uncompressed key (more info at https://github.com/indutny/elliptic/issues/138)
const verifyAS = tokensFactory.tokens.verifyJWT(
  signedAS,
  '04' + configData.subject1Pubk.substr(2)
)
console.log('\tIs the signedJWT verified?', verifyAS)
