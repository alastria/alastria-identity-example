const {transactionFactory, tokensFactory} = require('alastria-identity-lib')
const Web3 = require('web3')
const fs = require('fs')
const keythereum = require('keythereum')

let rawdata = fs.readFileSync('../configuration.json')
let config = JSON.parse(rawdata)

// Data
const tokenPayload = config.tokenPayload
// End data

let keyDataAdmin = fs.readFileSync('../keystores/admin-6e3976aeaa3a59e4af51783cc46ee0ffabc5dc11.json')
let keystoreDataAdmin = JSON.parse(keyDataAdmin)

let adminKeyStore = keystoreDataAdmin

let adminPrivateKey
try {
	adminPrivateKey = keythereum.recover(config.addressPassword, adminKeyStore)
} catch (error) {
	console.log("ERROR: ", error)
	process.exit(1);
}


console.log("---- signJWT ----")

const signedJWT = tokensFactory.tokens.signJWT(tokenPayload, adminPrivateKey)
console.log('\tThe signed JWT is: ', signedJWT)

console.log("\n---- decodeJWT ----")

let decodedJWT = tokensFactory.tokens.decodeJWT(signedJWT)
console.log('\tThe decoded token is: \n', decodedJWT)

console.log("\n---- verifyJWT ----")

// '04' means uncompressed key (more info at https://github.com/indutny/elliptic/issues/138)
let verifyJWT = tokensFactory.tokens.verifyJWT(signedJWT, '04'+config.adminPubk.substr(2))
console.log('\tIs the signedJWT verified?', verifyJWT)

// Data
let context = config.context
let didIsssuer = config.didEntity3
let providerURL = config.providerURL
let callbackURL = config.callbackURL
let alastriaNetId = config.alastriaNetId
let tokenExpTime = config.tokenExpTime
let tokenActivationDate = config.tokenActivationDate
let jsonTokenId = config.jsonTokenId
// End data

console.log("\n---- createAlastriaToken ----")

const alastriaToken = tokensFactory.tokens.createAlastriaToken(didIsssuer, providerURL, callbackURL, alastriaNetId, tokenExpTime, tokenActivationDate, jsonTokenId)
console.log('\tThe Alastria token is: \n', alastriaToken)

// Signing the AlastriaToken
let signedAT = tokensFactory.tokens.signJWT(alastriaToken, adminPrivateKey)

console.log("\n---- createAlastriaSesion ----")

const alastriaSession = tokensFactory.tokens.createAlastriaSession(context, didIsssuer, config.adminPubk, signedAT, tokenExpTime, tokenActivationDate, jsonTokenId)
console.log('\tThe Alastria session is:\n', alastriaSession)

// Data
let jti = config.jti
let kidCredential = config.kidCredential
let subjectAlastriaID = config.subjectAlastriaID
let credentialSubject = {};
let credentialKey = config.credentialKey
let credentialValue = config.credentialValue
credentialSubject[credentialKey]=credentialValue;
credentialSubject["levelOfAssurance"]="basic";
// End data

console.log("\n---- createCredential ----")

const credential1 = tokensFactory.tokens.createCredential(kidCredential, config.didEntity1, subjectAlastriaID, context, credentialSubject, tokenExpTime, tokenActivationDate, jti)
console.log('\nThe credential1 is: ', credential1)

console.log("\n---- PSMHash ----")

// Init your blockchain provider
let myBlockchainServiceIp = config.nodeUrl

const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

let psmHashSubject = tokensFactory.tokens.PSMHash(web3, signedJWT, config.didSubject1);
console.log("\tThe PSMHash is:", psmHashSubject);

let psmHashReciever = tokensFactory.tokens.PSMHash(web3, signedJWT, config.didEntity2);
console.log("\tThe PSMHashReciever is:", psmHashReciever);

console.log("\n---- Create AIC ----")
//create AIC

let txCreateAlastriaID = transactionFactory.identityManager.createAlastriaIdentity(web3, config.adminPubk)
let txCreateAlastriaIDSigned = tokensFactory.tokens.signJWT(txCreateAlastriaID, adminPrivateKey)

//Only the createAlastriaID transaction must be signed inside of AIC object
let aic = tokensFactory.tokens.createAIC(txCreateAlastriaIDSigned,alastriaToken,config.adminPubk);
console.log("\tAIC:", aic);

const signedJWTAIC = tokensFactory.tokens.signJWT(aic, adminPrivateKey)
console.log("AIC Signed:", signedJWTAIC)
