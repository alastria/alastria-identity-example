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

console.log('\n ------ Example of sending a transaction to the blockchain (for example creating a Service Provider identity) ------ \n')
// This is the account thtat deployed all the smart contracts (accounts[0])
// These values must be changed with the ones that ganache provides
// *IMPORTANT!* Take a look that the Private Key has no '0x'. Dont forget to remove it!

let adminKeyStore = {"address":"6e3976aeaa3a59e4af51783cc46ee0ffabc5dc11","crypto":{"cipher":"aes-128-ctr","ciphertext":"463a0bc2146023ac4b85f4e3675c338facb0a09c4f83f5f067e2d36c87a0c35e","cipherparams":{"iv":"d731f9793e33b3574303a863c7e68520"},"kdf":"scrypt","kdfparams":{"dklen":32,"n":262144,"p":1,"r":8,"salt":"876f3ca79af1ec9b77f181cbefc45a2f392cb8eb99fe8b3a19c79d62e12ed173"},"mac":"230bf3451a7057ae6cf77399e6530a88d60a8f27f4089cf0c07319f1bf9844b3"},"id":"9277b6ec-6c04-4356-9e1c-dee015f459c5","version":3};

let adminPrivateKey
try{
	adminPrivateKey = keythereum.recover('Passw0rd', adminKeyStore)
}catch(error){
	console.log("ERROR: ", error)
}

let adminIdentity = new UserIdentity(web3, `0x${adminKeyStore.address}`, adminPrivateKey)

//*IMPORTANT!* Also change the address here
new Promise((resolver, rechazar) => {
web3.eth.personal.unlockAccount(adminIdentity.address,"Passw0rd", 500)
.then(() => {
	resolver(0);
}).catch(error=> {
	console.log(error);
	rechazar(error);
})});


//The new Service Provider
let newSPKeyStore = {"address":"643266eb3105f4bf8b4f4fec50886e453f0da9ad","crypto":{"cipher":"aes-128-ctr","ciphertext":"019b915ddee1172f8475fb201bf9995cf3aac1b9fe22b438667def44a5537152","cipherparams":{"iv":"f8dd7c0eaa7a2b7c87991fe30dc9d632"},"kdf":"scrypt","kdfparams":{"dklen":32,"n":262144,"p":1,"r":8,"salt":"966a16bff9a4b14df58a462ba3c49364d42f2804b9eb47daf241f08950af8bdb"},"mac":"924356fbaa036d416fd9ab8c48dec451634f47dd093af4ce1fa682e8bf6753b3"},"id":"3073c62d-2dc1-4c1e-aa1c-ca089b69de16","version":3}
// Step 1, we call the function addIdentityServiceProvider which is in AlastriaIdentityManager.sol contract
transactionFactory.identityManager.addIdentityServiceProvider(web3, `0x${newSPKeyStore.address}`, adminIdentity.address)
.then(tx1 => {
	console.log('(addIdentityServiceProvider)The transaction is: ', tx1)
	// Step 2, we customize and sign the transaction by calling the function getKnownTransaction
	adminIdentity.getKnownTransaction(tx1)
	.then(txAddIdentityServiceProvider => {
		console.log('(addIdentityServiceProvider)The transaction bytes data is: ', txAddIdentityServiceProvider)
		// Step 3, we send the signed transaction to the blockchain
		adminIdentity.sendSignedTransaction(web3, txAddIdentityServiceProvider)
		.then(signedTx => {
			console.log("(addIdentityServiceProvider)The transaction hash is: ", signedTx);
		})
		.catch (error => { console.log("(addIdentityServiceProvider)Error ---->", error)})
	})
	.catch(error2 => {
		console.log('(addIdentityServiceProvider)Error -----> ', error)
	})
})
.catch(error3 => {
	console.log('(addIdentityServiceProvider)Error -----> ', error)
})