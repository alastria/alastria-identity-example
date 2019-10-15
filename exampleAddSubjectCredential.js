/*
 * This file is a tutorial of using the alastria-identity-lib
 * Create an empty directory to test it following the instructions of
 * https://github.com/alastria/alastria-identity-lib README.md
*/

let any = require('jsontokens')
const {transactionFactory, UserIdentity, tokensFactory, config} = require('alastria-identity-lib')
let Web3 = require('web3')
let fs = require('fs')
let keythereum = require('keythereum')

let rawdata = fs.readFileSync('./configuration.json')
let configData = JSON.parse(rawdata)

// Init your blockchain provider
let myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))
//let myBlockchainServiceIp = 'http://127.0.0.1:8545' //Ganache

//------------------------------------------------------------------------------
console.log('\n ------ Preparing Issuer identity ------ \n')

// Some fake data to test
const rawPublicKey = configData.rawPublicKey

let identityKeystore = configData.identityKeystore

let issuerPrivateKey
try{
	issuerPrivateKey = keythereum.recover(configData.addressPassword, identityKeystore)
}catch(error){
	console.log("ERROR: ", error)
}

let issuerIdentity = new UserIdentity(web3, `0x${identityKeystore.address}`, issuerPrivateKey)

let adminKeyStore = configData.adminKeyStore

let adminPrivateKey
try{
	adminPrivateKey = keythereum.recover(configData.addressPassword, adminKeyStore)
}catch(error){
	console.log("ERROR: ", error)
}

let adminIdentity = new UserIdentity(web3, `0x${adminKeyStore.address}`, adminPrivateKey)

 
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

	let promiseAdSubjectCredential = new Promise (async(resolve, reject) => {
		let subjectCredential = await transactionFactory.credentialRegistry.addSubjectCredential(web3, credentialHash, uri)
		console.log('(addSubjectCredential)The transaction is: ', subjectCredential)
		resolve(subjectCredential)
	})

	function sendSigned(subjectCredentialSigned) {
		return new Promise((resolve, reject) => {
			web3.eth.sendSignedTransaction(subjectCredentialSigned)
			.on('transactionHash', function (hash) {
				console.log("HASH: ", hash)
			})
			.on('receipt', receipt => {
				resolve(receipt)
			})
			.on('error', console.error); 

		})
	}
	
		
	Promise.all([promiseAdSubjectCredential])
	.then(async result => {
		let subjectCredentialSigned = await issuerIdentity.getKnownTransaction(result[0])
		console.log('(addSubjectCredential)The transaction bytes data is: ', subjectCredentialSigned)
		sendSigned(subjectCredentialSigned)
		.then(receipt => {
			console.log('RECEIPT:', receipt)
			let subject = "0x9d700a2fc6069555a42d39c6df0398087376c3f2"  //by the moment, change it manually from alastriaProxyAddress result in script exampleCreateAlastriaID.js 
			let subjectCredentialTransaction = transactionFactory.credentialRegistry.getSubjectCredentialStatus(web3, subject, credentialHash)
				web3.eth.call(subjectCredentialTransaction)
				.then(SubjectCredentialStatus => {
				let result = web3.eth.abi.decodeParameters(["bool","uint8"],SubjectCredentialStatus)
				let credentialStatus = { 
					"exists": result[0],
					"status":result[1]
				}
				console.log("(SubjectCredentialStatus) -----> ", credentialStatus);
			})
		})
	})	

