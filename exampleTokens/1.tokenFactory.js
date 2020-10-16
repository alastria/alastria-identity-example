const {
  PSMHash,
  createAIC,
  createAlastriaSession,
  createAlastriaToken,
  createCredential,
  createPresentation,
  createPresentationRequest,
  decodeJWT,
  signJWT,
  verifyJWT
} = require('alastria-identity-lib/dist/tokenFactory/jwt')
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

const signedJWT = signJWT(tokenPayload, adminPrivateKey)
console.log('\tThe signed JWT is: ', signedJWT)
tests.tokens.validateToken(signedJWT)

console.log('\n---- decodeJWT ----')

const decodedJWT = decodeJWT(signedJWT)
console.log('\tThe decoded token is: \n', decodedJWT)

console.log('\n---- verifyJWT ----')

// '04' means uncompressed key (more info at https://github.com/indutny/elliptic/issues/138)
const verifyJWT = verifyJWT(signedJWT, '04' + config.adminPubk.substr(2))
console.log('\tIs the signedJWT verified?', verifyJWT)

// Data
const context = config.context
const type = config.type
const didIsssuer = config.didEntity3
const providerURL = config.providerURL
const callbackURL = config.callbackURL
const alastriaNetId = config.networkId
const tokenExpTime = config.tokenExpTime
const tokenActivationDate = config.tokenActivationDate
const tokenNotBefore = config.tokenNotBefore
const jsonTokenId = config.jsonTokenId
const kidCredential = config.kidCredential
// End data

console.log('\n---- createAlastriaToken ----')

const alastriaToken = createAlastriaToken(
  didIsssuer,
  providerURL,
  callbackURL,
  alastriaNetId,
  tokenExpTime,
  kidCredential,
  config.adminPubk,
  tokenActivationDate,
  jsonTokenId
)
console.log('\tThe Alastria token is: \n', alastriaToken)

// Signing the AlastriaToken
const signedAT = signJWT(alastriaToken, adminPrivateKey)
tests.tokens.validateToken(signedAT)

console.log('\n---- createAlastriaSession ----')

const alastriaSession = createAlastriaSession(
  context,
  didIsssuer,
  config.kidCredential,
  type,
  signedAT,
  tokenExpTime,
  config.adminPubk,
  tokenActivationDate,
  jsonTokenId
)
console.log('\tThe Alastria session is:\n', alastriaSession)

// Data
const jti = config.jti
const subjectAlastriaID = config.subjectAlastriaID
const credentialSubject = {}
const credentialKey = config.credentialKey
const credentialValue = config.credentialValue
credentialSubject[credentialKey] = credentialValue
credentialSubject.levelOfAssurance = 'basic'
// End data

console.log('\n---- createCredential ----')

const credential1 = createCredential(
  config.didEntity1,
  context,
  credentialSubject,
  kidCredential,
  subjectAlastriaID,
  tokenExpTime,
  tokenActivationDate,
  jti
)
console.log('\nThe credential1 is: ', credential1)

console.log('\n---- PSMHash ----')

// Init your blockchain provider
const myBlockchainServiceIp = config.nodeUrl

const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

const psmHashSubject = PSMHash(web3, signedJWT, config.didSubject1)
console.log('\tThe PSMHash is:', psmHashSubject)

const psmHashReciever = PSMHash(web3, signedJWT, config.didEntity2)
console.log('\tThe PSMHashReciever is:', psmHashReciever)

console.log('\n---- Create AIC ----')
// create AIC

// Only the createAlastriaID transaction must be signed inside of AIC object
const aic = createAIC(
  context,
  type,
  config.signedTxCreateAlastriaID,
  signedAT,
  config.adminPubk,
  kidCredential,
  config.adminPubk,
  jti,
  tokenActivationDate,
  tokenExpTime,
  tokenNotBefore
)
console.log('\tAIC:', aic)

const signedJWTAIC = signJWT(aic, adminPrivateKey)
console.log('AIC Signed:', signedJWTAIC)
tests.alastriaIdCreations.validateAlastriaIdCreation(signedJWTAIC)

// Data
const procUrl = config.procUrl
const procHash = config.procHash
const data = config.data
// End data

console.log('\n---- createPresentationRequest ----')

const presentationRequest = createPresentationRequest(
  didIsssuer,
  context,
  procUrl,
  procHash,
  data,
  callbackURL,
  type,
  kidCredential,
  config.adminPubk,
  tokenExpTime,
  tokenActivationDate,
  jti
)

const signedPresentationRequest = signJWT(presentationRequest, adminPrivateKey)
console.log('\nThe presentationRequest is: ', signedPresentationRequest)
tests.presentationRequests.validatePresentationRequest(
  signedPresentationRequest
)

const presentation = createPresentation(
  didIsssuer,
  didIsssuer,
  context,
  signJWT(presentationRequest, adminPrivateKey),
  procUrl,
  procHash,
  type,
  kidCredential,
  config.adminPubk,
  tokenExpTime,
  tokenActivationDate,
  jti
)
const signedPresentation = signJWT(presentation, adminPrivateKey)
console.log('\nThe presentation is: ', signedPresentation)
tests.presentations.validatePresentation(signedPresentation)
