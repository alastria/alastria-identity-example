const { transactionFactory, UserIdentity, config, tokensFactory } = require('alastria-identity-lib')
const fs = require('fs')
const Web3 = require('web3')
const keythereum = require('keythereum')
const Wallet = require('ethereumjs-wallet')
const hdkey = require('ethereumjs-wallet/hdkey')
const privateKey = hdkey.fromMasterSeed('random')._hdkey._privateKey

let rawdata = fs.readFileSync('../configuration.json')
let configData = JSON.parse(rawdata)

let keyDataEntity1 = fs.readFileSync('../keystores/entity1-a9728125c573924b2b1ad6a8a8cd9bf6858ced49.json')
let keystoreDataEntity1 = JSON.parse(keyDataEntity1)
let keyDataSubject1 = fs.readFileSync('../keystores/subject1-806bc0d7a47b890383a831634bcb92dd4030b092.json')
let keystoreDataSubject1 = JSON.parse(keyDataSubject1)

// Init your blockchain provider
let myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

// Data
let context = configData.context
let providerURL = configData.providerURL
let callbackURL = configData.callbackURL
let alastriaNetId = configData.alastriaNetId
let tokenExpTime = configData.tokenExpTime
let tokenActivationDate = configData.tokenActivationDate
let jsonTokenId = configData.jsonTokenId


let entity1KeyStore = keystoreDataEntity1

let entity1PrivateKey
try {
	entity1PrivateKey = keythereum.recover(configData.addressPassword, entity1KeyStore)
} catch (error) {
	console.log("ERROR: ", error)
	process.exit(1);
}

let subject1Keystore = keystoreDataSubject1

let subject1PrivateKey
try {
	subject1PrivateKey = keythereum.recover(configData.addressPassword, subject1Keystore)
} catch (error) {
	console.log("ERROR: ", error)
	process.exit(1);
}

console.log('\n ------ Example of Authentication ------ \n')

const alastriaToken = tokensFactory.tokens.createAlastriaToken(configData.didEntity1, providerURL, callbackURL, alastriaNetId, tokenExpTime, tokenActivationDate, jsonTokenId)
console.log('\tThe Alastria token is: \n', alastriaToken)

// Signing the AlastriaToken
let signedAT = tokensFactory.tokens.signJWT(alastriaToken, entity1PrivateKey)

const entity1Puk = Wallet.fromPrivateKey(entity1PrivateKey)
console.log("entity1Puk pubk:", '04'+entity1Puk.getPublicKeyString().substr(2))

  let verifyAT = tokensFactory.tokens.verifyJWT(signedAT, "04"+entity1Puk.getPublicKeyString().substr(2))
  console.log('\tIs the signedJWT verified?', verifyAT)


const alastriaSession = tokensFactory.tokens.createAlastriaSession(context, configData.didSubject, "04"+entity1Puk.getPublicKeyString().substr(2), signedAT, tokenExpTime, tokenActivationDate, jsonTokenId)
console.log('\tThe Alastria session is:\n', alastriaSession)

let signedAS = tokensFactory.tokens.signJWT(alastriaSession, subject1PrivateKey)

const subject1Puk = Wallet.fromPrivateKey(subject1PrivateKey)
console.log("entity1Puk pubk:", '04'+subject1Puk.getPublicKeyString().substr(2))

let verifyAS = tokensFactory.tokens.verifyJWT(signedAS, "04"+subject1Puk.getPublicKeyString().substr(2))
console.log('\tIs the signedJWT verified?', verifyAS)
