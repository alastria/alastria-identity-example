const { transactionFactory, tokensFactory } = require('alastria-identity-lib')
const { tests } = require('alastria-identity-JSON-objects/tests')
const Web3 = require('web3')
const fs = require('fs')
const keythereum = require('keythereum')

const rawdata = fs.readFileSync('../configuration.json')
const config = JSON.parse(rawdata)

// Data
const tokenPayload = config.tokenPayload
// End data

const keyDataAdmin = fs.readFileSync(
  '../keystores/admin-6e3976aeaa3a59e4af51783cc46ee0ffabc5dc11.json'
)
const keystoreDataAdmin = JSON.parse(keyDataAdmin)

const adminKeyStore = keystoreDataAdmin

let adminPrivateKey
try {
  adminPrivateKey = keythereum.recover(config.addressPassword, adminKeyStore)
} catch (error) {
  console.log('ERROR: ', error)
  process.exit(1)
}

console.log('---- signJWT ----')

const signedJWT = tokensFactory.tokens.signJWT(tokenPayload, adminPrivateKey)
console.log('\tThe signed JWT is: ', signedJWT)
tests.tokens.validateToken(signedJWT);

console.log('\n---- decodeJWT ----')

const decodedJWT = tokensFactory.tokens.decodeJWT(signedJWT)
console.log('\tThe decoded token is: \n', decodedJWT)


console.log('\n---- verifyJWT ----')

// '04' means uncompressed key (more info at https://github.com/indutny/elliptic/issues/138)
const verifyJWT = tokensFactory.tokens.verifyJWT(
  signedJWT,
  '04' + config.adminPubk.substr(2)
)
console.log('\tIs the signedJWT verified?', verifyJWT)

// Data
const context = config.context
const didIsssuer = config.didEntity3
const providerURL = config.providerURL
const callbackURL = config.callbackURL
const alastriaNetId = config.networkId
const tokenExpTime = config.tokenExpTime
const tokenActivationDate = config.tokenActivationDate
const jsonTokenId = config.jsonTokenId
// End data

console.log('\n---- createAlastriaToken ----')

const alastriaToken = tokensFactory.tokens.createAlastriaToken(
  didIsssuer,
  providerURL,
  callbackURL,
  alastriaNetId,
  tokenExpTime,
  tokenActivationDate,
  jsonTokenId
)
console.log('\tThe Alastria token is: \n', alastriaToken)

// Signing the AlastriaToken
const signedAT = tokensFactory.tokens.signJWT(alastriaToken, adminPrivateKey)
tests.tokens.validateToken(signedAT);

console.log('\n---- createAlastriaSesion ----')

const alastriaSession = tokensFactory.tokens.createAlastriaSession(
  context,
  didIsssuer,
  config.adminPubk,
  signedAT,
  tokenExpTime,
  tokenActivationDate,
  jsonTokenId
)
console.log('\tThe Alastria session is:\n', alastriaSession)

// Data
const jti = config.jti
const kidCredential = config.kidCredential
const subjectAlastriaID = config.subjectAlastriaID
const credentialSubject = {}
const credentialKey = config.credentialKey
const credentialValue = config.credentialValue
credentialSubject[credentialKey] = credentialValue
credentialSubject.levelOfAssurance = 'basic'
// End data

console.log('\n---- createCredential ----')

const credential1 = tokensFactory.tokens.createCredential(
  kidCredential,
  config.didEntity1,
  subjectAlastriaID,
  context,
  credentialSubject,
  tokenExpTime,
  tokenActivationDate,
  jti
)
console.log('\nThe credential1 is: ', credential1)

console.log('\n---- PSMHash ----')

// Init your blockchain provider
const myBlockchainServiceIp = config.nodeUrl

const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

const psmHashSubject = tokensFactory.tokens.PSMHash(
  web3,
  signedJWT,
  config.didSubject1
)
console.log('\tThe PSMHash is:', psmHashSubject)

const psmHashReciever = tokensFactory.tokens.PSMHash(
  web3,
  signedJWT,
  config.didEntity2
)
console.log('\tThe PSMHashReciever is:', psmHashReciever)

console.log('\n---- Create AIC ----')
// create AIC

const txCreateAlastriaID = transactionFactory.identityManager.createAlastriaIdentity(
  web3,
  config.adminPubk
)
const txCreateAlastriaIDSigned = tokensFactory.tokens.signJWT(
  txCreateAlastriaID,
  adminPrivateKey
)

// Only the createAlastriaID transaction must be signed inside of AIC object
const aic = tokensFactory.tokens.createAIC(
  txCreateAlastriaIDSigned,
  alastriaToken,
  config.adminPubk
)
console.log('\tAIC:', aic)

const signedJWTAIC = tokensFactory.tokens.signJWT(aic, adminPrivateKey)
console.log('AIC Signed:', signedJWTAIC)
tests.alastriaIdCreations.validateAlastriaIdCreation(signedJWTAIC);

// Data
const procUrl = config.procUrl
const procHash = config.procHash
const data = config.data
// End data

console.log('\n---- createPresentationRequest ----')

const presentationRequest = tokensFactory.tokens.createPresentationRequest(
  kidCredential,
  didIsssuer,
  context,
  procUrl,
  procHash,
  data,
  callbackURL,
  tokenExpTime,
  tokenActivationDate,
  jti
)
console.log('\nThe presentationRequest is: ', presentationRequest)
