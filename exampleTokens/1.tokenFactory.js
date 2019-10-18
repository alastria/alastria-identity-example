const {transactionFactory, UserIdentity, tokensFactory} = require('alastria-identity-lib')
const Web3 = require('web3')
const fs = require('fs')

let rawdata = fs.readFileSync('../configuration.json')
let config = JSON.parse(rawdata)
console.log(config)

// Data
const rawPublicKey = config.rawPublicKey
const rawPrivateKey = config.rawPrivateKey
const tokenPayload = config.tokenPayload
// End data

console.log("---- signJWT ----")

const signedJWT = tokensFactory.tokens.signJWT(tokenPayload, rawPrivateKey)
console.log('\tThe signed JWT is: ', signedJWT)

console.log("\n---- decodeJWT ----")

let decodedJWT = tokensFactory.tokens.decodeJWT(signedJWT)
console.log('\tThe decoded token is: \n', decodedJWT)

console.log("\n---- verifyJWT ----")

let verifyJWT = tokensFactory.tokens.verifyJWT(signedJWT, rawPublicKey)
console.log('\tIs the signedJWT verified?', verifyJWT)

// Data
let context = config.context
let userPublicKey = config.userPublicKey
let didIsssuer = config.didIsssuer
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
let signedAT = tokensFactory.tokens.signJWT(alastriaToken, rawPrivateKey)

console.log("\n---- createAlastriaSesion ----")

const alastriaSession = tokensFactory.tokens.createAlastriaSession(context, didIsssuer, userPublicKey, signedAT, tokenExpTime, tokenActivationDate, jsonTokenId)
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

const credential1 = tokensFactory.tokens.createCredential(kidCredential, didIsssuer, subjectAlastriaID, context, credentialSubject, tokenExpTime, tokenActivationDate, jti)
console.log('\nThe credential1 is: ', credential1)

console.log("\n---- PSMHash ----")

// Init your blockchain provider
let myBlockchainServiceIp = config.nodeUrl

const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

let psmHash = tokensFactory.tokens.PSMHash(web3, signedJWT, didIsssuer);
console.log("\tThe PSMHash is:", psmHash);


console.log("\n---- Create AIC ----")
//create AIC

let txCreateAlastriaID = transactionFactory.identityManager.createAlastriaIdentity(web3, rawPublicKey)

let aic = tokensFactory.tokens.createAIC(txCreateAlastriaID,alastriaToken,userPublicKey);
console.log("\tAIC:", aic);

const signedJWTAIC = tokensFactory.tokens.signJWT(aic, rawPrivateKey)
console.log("AIC Signed:", signedJWTAIC)

// Data
let procUrl = config.procUrl
let procHash = config.procHash
let data = config.data
// End data
