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

let entity1Keystore = keystoreData.entity1

let entity1PrivateKey
try{
	entity1PrivateKey = keythereum.recover(keystoreData.addressPassword, entity1Keystore)
}catch(error){
	console.log("ERROR: ", error)
}

let entity1Identity = new UserIdentity(web3, `0x${entity1Keystore.address}`, entity1PrivateKey)

// Im not sure if this is needed
async function unlockAccount() {
	let unlockedAccount = await web3.eth.personal.unlockAccount(entity1Identity.address, keystoreData.addressPassword, 500)
	console.log('Account unlocked:', unlockedAccount)
	return unlockedAccount
}

let entity3KeyStore = keystoreData.entity3;

async function mainAdd() {
	unlockAccount()
	console.log('\n ------ Example of adding  the entity3 like Issuer ------ \n')
	let transaction = await transactionFactory.identityManager.addIdentityIssuer(web3, `0x${entity3KeyStore.address}`, configData.issuerLevel)
	let getKnownTx = await entity1Identity.getKnownTransaction(transaction)
	console.log('The transaction bytes data is: ', getKnownTx)
	web3.eth.sendSignedTransaction(getKnownTx)
	.on('transactionHash', function (hash) {
		console.log("HASH: ", hash)
	})
	.on('receipt', function (receipt) {
		console.log("RECEIPT: ", receipt)
	})
	.on('error', console.error); 
	// If this is a revert, probably this Subject (address) is already a SP
}

mainAdd()
