const {transactionFactory, UserIdentity, tokensFactory} = require('alastria-identity-lib')
let Web3 = require('web3')
let fs = require('fs')
let keythereum = require('keythereum')

let rawdata = fs.readFileSync('./configuration.json')
let configData = JSON.parse(rawdata)

// Init your blockchain provider
let myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

//------------------------------------------------------------------------------
console.log('\n ------ Preparing Issuer identity ------ \n')

// Some fake data to test

let identityKeystore = configData.identityKeystore

let issuerPrivateKey
try{
	issuerPrivateKey = keythereum.recover(configData.addressPassword, identityKeystore)
}catch(error){
	console.log("ERROR: ", error)
}

let issuerIdentity = new UserIdentity(web3, `0x${identityKeystore.address}`, issuerPrivateKey)
 
console.log('\n ------ Creating credential ------ \n')

let jti = configData.jti
let kidCredential = configData.kidCredential
let subjectAlastriaID = configData.subjectAlastriaID
let didIsssuer = configData.didIsssuer
let context = configData.context
let tokenExpTime = configData.tokenExpTime
let tokenActivationDate = configData.tokenActivationDate

// Credential Map (key-->value)
let credentialSubject = {};
let credentialKey =configData.credentialKey
let credentialValue = configData.credentialValue
credentialSubject[credentialKey]=credentialValue;
credentialSubject["levelOfAssurance"]="basic";
const uri = configData.uri

//End fake data to test

const credential = tokensFactory.tokens.createCredential(kidCredential, didIsssuer, subjectAlastriaID, context, credentialSubject, tokenExpTime, tokenActivationDate, jti)
console.log('The credential1 is: ', credential)


const signedJWTCredential = tokensFactory.tokens.signJWT(credential, issuerPrivateKey)
console.log('The signed token is: ', signedJWTCredential)

const credentialHash = tokensFactory.tokens.PSMHash(web3, signedJWTCredential, didIsssuer);
console.log("The PSMHash is:", credentialHash);

	let subject = `0x537b90f1c210f58ff45951d5edc83e92ecce6e17`
	let credentialList = transactionFactory.credentialRegistry.getSubjectCredentialList(web3, subject)
	console.log('(credentialList) Transaction ------>', credentialList)
	web3.eth.call(credentialList)
	.then(subjectCredentialList => {
		console.log('(subjectCredentialList) Transaction ------->', subjectCredentialList)
		let resultList = web3.eth.abi.decodeParameters(["uint256", "bytes32[]"], subjectCredentialList)
		let credentialList = {
			"uint": resultList[0],
			"bytes32[]": resultList[1]
		}
		console.log('(subjectCredentialList) TransactionList: ', credentialList)
	})
	.catch(errorList => {
		console.log('Error List -----> ', errorList)
	})