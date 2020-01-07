const {transactionFactory, UserIdentity} = require('alastria-identity-lib')
let Web3 = require('web3')
let fs = require('fs')
let keythereum = require('keythereum')

let rawdata = fs.readFileSync('../configuration.json')
let configData = JSON.parse(rawdata)

let keyData = fs.readFileSync('../keystore/keystore.json')
let keystoreData = JSON.parse(keyData)

// Init your blockchain provider
let myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

let adminKeyStore = keystoreData.admin

let adminPrivateKey
try{
	adminPrivateKey = keythereum.recover(keystoreData.addressPassword, adminKeyStore)
}catch(error){
	console.log("ERROR: ", error)
}

let adminIdentity = new UserIdentity(web3, `0x${adminKeyStore.address}`, adminPrivateKey)

// Im not sure if this is needed
async function unlockAccount() {
	let unlockedAccount = await web3.eth.personal.unlockAccount(adminIdentity.address, keystoreData.addressPassword, 500)
	console.log('Account unlocked:', unlockedAccount)
	return unlockedAccount
}

let entity1KeyStore = keystoreData.entity1;

async function mainAdd() {
	unlockAccount()
	console.log('\n ------ Example of adding a Issuer ------ \n')
	let transactionA = await transactionFactory.identityManager.addIdentityIssuer(web3, `0x${entity1KeyStore.address}`, configData.issuerLevel)
	let getKnownTxA = await adminIdentity.getKnownTransaction(transactionA)
	console.log('The transaction bytes data is: ', getKnownTxA)
	web3.eth.sendSignedTransaction(getKnownTxA)
	.on('transactionHash', function (hashA) {
		console.log("HASH: ", hashA)
	})
	.on('receipt', function (receiptA) {
		console.log("RECEIPT: ", receiptA)
	})
	.on('error', console.error); 
	// If this is a revert, probably this Subject (address) is already a SP
}

mainAdd()
