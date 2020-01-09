const {transactionFactory, UserIdentity, tokensFactory} = require('alastria-identity-lib')
let Web3 = require('web3')
let fs = require('fs')
let keythereum = require('keythereum')

let rawdata = fs.readFileSync('../configuration.json')
let configData = JSON.parse(rawdata)

let keyDataEntity1 = fs.readFileSync('../keystores/entity1-a9728125c573924b2b1ad6a8a8cd9bf6858ced49.json')
let keystoreDataEntity1 = JSON.parse(keyDataEntity1)
let keyDataSubject1 = fs.readFileSync('../keystores/subject1-806bc0d7a47b890383a831634bcb92dd4030b092.json')
let keystoreDataSubject1 = JSON.parse(keyDataSubject1)

// Init your blockchain provider
let myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))
//------------------------------------------------------------------------------
console.log('\n ------ Preparing Subject1 identity ------ \n')

// Some fake data to test

let entity1KeyStore = keystoreDataEntity1

let entity1PrivateKey
try{
	entity1PrivateKey = keythereum.recover(configData.addressPassword, entity1KeyStore)
}catch(error){
	console.log("ERROR: ", error)
}

let entity1Identity = new UserIdentity(web3, `0x${entity1KeyStore.address}`, entity1PrivateKey)

let subject1KeyStore = keystoreDataSubject1

let subject1PrivateKey
try{
	subject1PrivateKey = keythereum.recover(configData.addressPassword, subject1KeyStore)
}catch(error){
	console.log("ERROR: ", error)
}

let subject1Identity = new UserIdentity(web3, `0x${subject1KeyStore.address}`, subject1PrivateKey)
 
console.log('\n ------ Creating credential ------ \n')

let jti = configData.jti
let kidCredential = configData.kidCredential
let subjectAlastriaID = configData.subjectAlastriaID
let didEntity1 = configData.didEntity1
let didSubject1 = configData.didSubject1
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

const credential = tokensFactory.tokens.createCredential(kidCredential, didEntity1, subjectAlastriaID, context, credentialSubject, tokenExpTime, tokenActivationDate, jti)
console.log('The credential1 is: ', credential)


const signedJWTCredential = tokensFactory.tokens.signJWT(credential, entity1PrivateKey)
console.log('The signed token is: ', signedJWTCredential)

const subjectCredentialHash = tokensFactory.tokens.PSMHash(web3, signedJWTCredential, didSubject1);
console.log("The Subject1 PSMHash is " ,subjectCredentialHash);
fs.writeFileSync(`./PSMHashSubject1.json`, JSON.stringify({psmhash: subjectCredentialHash, jwt: signedJWTCredential}))


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

		let subjectCredentialSigned = await subject1Identity.getKnownTransaction(resultSubjectCredential)
		console.log('(addSubjectCredential)The transaction bytes data is: ', subjectCredentialSigned)
		sendSigned(subjectCredentialSigned)
		.then(receipt => {
			console.log('RECEIPT:', receipt)
			let subject1 = configData.subject1  //by the moment, change it manually from alastriaProxyAddress result in script exampleCreateAlastriaID.js 
			let subjectCredentialTransaction = transactionFactory.credentialRegistry.getSubjectCredentialStatus(web3, subject1, subjectCredentialHash)
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
