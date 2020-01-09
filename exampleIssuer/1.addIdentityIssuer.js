const {transactionFactory, UserIdentity} = require('alastria-identity-lib')
let Web3 = require('web3')
let fs = require('fs')
let keythereum = require('keythereum')

let rawdata = fs.readFileSync('../configuration.json')
let configData = JSON.parse(rawdata)

let keyDataEntity1 = fs.readFileSync('../keystores/entity1-a9728125c573924b2b1ad6a8a8cd9bf6858ced49.json')
let keystoreDataEntity1 = JSON.parse(keyDataEntity1)
let keyDataEntity3 = fs.readFileSync('../keystores/entity3-de7ab34219563ac50ccc7b51d23b9a61d22a383e.json')
let keystoreDataEntity3 = JSON.parse(keyDataEntity3)

// Init your blockchain provider
let myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

let entity1Keystore = keystoreDataEntity1

let entity1PrivateKey
try{
	entity1PrivateKey = keythereum.recover(configData.addressPassword, entity1Keystore)
}catch(error){
	console.log("ERROR: ", error)
}

let entity1Identity = new UserIdentity(web3, `0x${entity1Keystore.address}`, entity1PrivateKey)

// Im not sure if this is needed
async function unlockAccount() {
	let unlockedAccount = await web3.eth.personal.unlockAccount(entity1Identity.address, configData.addressPassword, 500)
	console.log('Account unlocked:', unlockedAccount)
	return unlockedAccount
}

let entity3KeyStore = keystoreDataEntity3;

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
