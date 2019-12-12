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
console.log('\n ------ Preparing Issuer identity ------ \n')

// Some fake data to test

let issuerKeystore = keystoreData.issuerKeystore

let issuerPrivateKey
try{
	issuerPrivateKey = keythereum.recover(keystoreData.addressPassword, issuerKeystore)
}catch(error){
	console.log("ERROR: ", error)
}

let issuerIdentity = new UserIdentity(web3, `0x${issuerKeystore.address}`, issuerPrivateKey)
 
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

	function addIssuerCredential() {
		let issuerCredential = transactionFactory.credentialRegistry.addIssuerCredential(web3, credentialHash)
		console.log('(addIssuerCredential)The transaction is: ', issuerCredential)
		return issuerCredential
	}

	function sendSigned(issuerCredentialSigned) {
		return new Promise((resolve, reject) => {
			web3.eth.sendSignedTransaction(issuerCredentialSigned)
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
		let resultIssuerCredential = await addIssuerCredential()

		let issuerCredentialSigned = await issuerIdentity.getKnownTransaction(resultIssuerCredential)
		console.log('(addIssuerCredential)The transaction bytes data is: ', issuerCredentialSigned)
		sendSigned(issuerCredentialSigned)
		.then(receipt => {
			console.log('RECEIPT:', receipt)
			let issuer = configData.issuer  //by the moment, change it manually from alastriaProxyAddress result in script exampleCreateAlastriaID.js 
			let issuerCredentialTransaction = transactionFactory.credentialRegistry.getIssuerCredentialStatus(web3, issuer, credentialHash)
				web3.eth.call(issuerCredentialTransaction)
				.then(IssuerCredentialStatus => {
					let result = web3.eth.abi.decodeParameters(["bool","uint8"],IssuerCredentialStatus)
					let credentialStatus = { 
						"exists": result[0],
						"status":result[1]
					}
					console.log("(IssuerCredentialStatus) -----> ", credentialStatus);
			})
		})
	}
	main()
