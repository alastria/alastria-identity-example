/*
 * This file is a tutorial of using the alastria-identity-lib
 * Create an empty directory to test it following the instructions of
 * https://github.com/alastria/alastria-identity-lib README.md
*/

let any = require('jsontokens')
const {transactionFactory, UserIdentity, tokensFactory} = require('alastria-identity-lib')
let Web3 = require('web3')
let keythereum = require('keythereum')

// Init your blockchain provider
let myBlockchainServiceIp = 'http://63.33.206.111/rpc'
//let myBlockchainServiceIp = 'http://127.0.0.1:8545' //Ganache
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))
console.log('VERSION: ', web3.version)



//------------------------------------------------------------------------------
console.log('\n ------ Preparing Issuer identity ------ \n')

// Some fake data to test
const rawPublicKey = '03fdd57adec3d438ea237fe46b33ee1e016eda6b585c3e27ea66686c2ea5358479'

let issuerKeyStore = {"address":"6e3976aeaa3a59e4af51783cc46ee0ffabc5dc11","crypto":{"cipher":"aes-128-ctr","ciphertext":"463a0bc2146023ac4b85f4e3675c338facb0a09c4f83f5f067e2d36c87a0c35e","cipherparams":{"iv":"d731f9793e33b3574303a863c7e68520"},"kdf":"scrypt","kdfparams":{"dklen":32,"n":262144,"p":1,"r":8,"salt":"876f3ca79af1ec9b77f181cbefc45a2f392cb8eb99fe8b3a19c79d62e12ed173"},"mac":"230bf3451a7057ae6cf77399e6530a88d60a8f27f4089cf0c07319f1bf9844b3"},"id":"9277b6ec-6c04-4356-9e1c-dee015f459c5","version":3};

let issuerPrivateKey
try{
	issuerPrivateKey = keythereum.recover('Passw0rd', issuerKeyStore)
}catch(error){
	console.log("ERROR: ", error)
}

let issuerIdentity = new UserIdentity(web3, `0x${issuerKeyStore.address}`, issuerPrivateKey)
 
console.log('\n ------ Creating credential ------ \n')

let jti = "https://www.metrovacesa.com/alastria/credentials/3734";
//The "kid" (key ID) parameter indicates which key was used to secure (digitally sign) the JWT.
let kidCredential = "did:ala:quor:redt:QmeeasCZ9jLbXueBJ7d7csxhb#keys-1";
//The DID representing the AlastriaID of the subject to which the credential refers to.
let subjectAlastriaID = "did:alastria:quorum:redt:QmeeasCZ9jLbXueBJ7d7csxhb";

let didIsssuer = "did:ala:quor:telsius:0x12345"

let context = "https://w3id.org/did/v1"

let tokenExpTime = 1563783392

let tokenActivationDate = 1563782792

// Credential Map (key-->value)
let credentialSubject = {};
let credentialKey ="StudentID"
let credentialValue ="11235813"
credentialSubject[credentialKey]=credentialValue;
credentialSubject["levelOfAssurance"]="basic";

const credential = tokensFactory.tokens.createCredential(kidCredential, didIsssuer, subjectAlastriaID, context, credentialSubject, tokenExpTime, tokenActivationDate, jti)
console.log('The credential1 is: ', credential)


const signedJWTCredential = tokensFactory.tokens.signJWT(credential, issuerPrivateKey)
console.log('The signed token is: ', signedJWTCredential)

const credentialHash = tokensFactory.tokens.PSMHash(web3, signedJWTCredential, didIsssuer);
console.log("The PSMHash is:", credentialHash);

const uri = "www.google.com"

	let p1 = new Promise (async(resolve, reject) => {
		let subjectCredential = await transactionFactory.credentialRegistry.addSubjectCredential(web3, credentialHash, uri)
		console.log('(addSubjectCredential)The transaction is: ', subjectCredential)
		resolve(subjectCredential)
	})
	
	Promise.all([p1])
	.then(async values => {
		console.log("---------------------------------*********************************",values[0])
	let subjectCredentialSigned = await issuerIdentity.getKnownTransaction(values[0])
			console.log('(addSubjectCredential)The transaction bytes data is: ', subjectCredentialSigned)
			// Step 6, we send the signed transaction to the blockchain
			web3.eth.sendSignedTransaction(subjectCredentialSigned)
			.on('transactionHash', function (hash) {
				console.log("HASH: ", hash)
			})
			.on('error', console.error); 
	})
