const {transactionFactory, UserIdentity, tokensFactory} = require('alastria-identity-lib')
let Web3 = require('web3')
let fs = require('fs')
let keythereum = require('keythereum')

let rawdata = fs.readFileSync('../configuration.json')
let configData = JSON.parse(rawdata)

let keyData = fs.readFileSync('../keystore.json')
let keystoreData = JSON.parse(keyData)

// Init your blockchain provider
let myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))
//------------------------------------------------------------------------------
console.log('\n ------ Preparing Subject identity ------ \n')

// Some fake data to test

let issuerKeystore = keystoreData.issuerKeystore

let issuerPrivateKey
try{
	issuerPrivateKey = keythereum.recover(keystoreData.addressPassword, issuerKeystore)
}catch(error){
	console.log("ERROR: ", error)
}

let issuerIdentity = new UserIdentity(web3, `0x${issuerKeystore.address}`, issuerPrivateKey)


let subjectKeystore = keystoreData.subjectKeystore

let subjectPrivateKey
try{
	subjectPrivateKey = keythereum.recover(keystoreData.addressPassword, subjectKeystore)
}catch(error){
	console.log("ERROR: ", error)
}

let subjectIdentity = new UserIdentity(web3, `0x${subjectKeystore.address}`, subjectPrivateKey)
 
console.log('\n ------ Creating credential ------ \n')

let jti = configData.jti
let kidCredential = configData.kidCredential
let subjectAlastriaID = configData.subjectAlastriaID
let didIsssuer = configData.didIsssuer
let didSubject = configData.didSubject
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

const subjectCredentialHash = tokensFactory.tokens.PSMHash(web3, signedJWTCredential, didSubject);
console.log("The Subject PSMHash is " ,subjectCredentialHash);

	function addSubjectCredential() {
		let subjectCredential = transactionFactory.credentialRegistry.addSubjectCredential(web3, subjectCredentialHash, uri)
		console.log('(addSubjectCredential)The transaction is: ', subjectCredential)
		return subjectCredential
	}

	function sendSigned(subjectCredentialSigned) {
		return new Promise((resolve, reject) => {
			// web3 default subject address
			web3.eth.sendSignedTransaction(subjectCredentialSigned)
			.on('transactionHash', function (hash) {
				console.log("HASH: ", hash)
			})
			.on('receipt', receipt => {
				resolve(receipt)
			})
			.on('error', error => {
				console.log('Error------>', error)
				reject(error)
			}); 

		})
	}


	async function main() {
		let resultSubjectCredential = await addSubjectCredential()

		let subjectCredentialSigned = await subjectIdentity.getKnownTransaction(resultSubjectCredential)
		console.log('(addSubjectCredential)The transaction bytes data is: ', subjectCredentialSigned)
		sendSigned(subjectCredentialSigned)
		.then(receipt => {
			console.log('RECEIPT:', receipt)
			let subject = configData.subject  //by the moment, change it manually from alastriaProxyAddress result in script exampleCreateAlastriaID.js 
			let subjectCredentialTransaction = transactionFactory.credentialRegistry.getSubjectCredentialStatus(web3, subject, subjectCredentialHash)
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
	}
	main()
