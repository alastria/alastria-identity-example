const {transactionFactory, UserIdentity} = require('alastria-identity-lib')
let Web3 = require('web3')
let fs = require('fs')
let keythereum = require('keythereum')

let rawdata = fs.readFileSync('../configuration.json')
let configData = JSON.parse(rawdata)

let keyDataEntity1 = fs.readFileSync('../keystores/entity1-a9728125c573924b2b1ad6a8a8cd9bf6858ced49.json')
let keystoreDataEntity1 = JSON.parse(keyDataEntity1)
let keyDataEntity2 = fs.readFileSync('../keystores/entity2-ad88f1a89cf02a32010b971d8c8af3a2c7b3bd94.json')
let keystoreDataEntity2 = JSON.parse(keyDataEntity2)

// Init your blockchain provider
let myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

let entity1Keystore = keystoreDataEntity1

let entity1PrivateKey
try{
	entity1PrivateKey = keythereum.recover(configData.addressPassword, entity1Keystore)
}catch(error){
	console.log("ERROR: ", error)
	process.exit(1);
}

let entity1Identity = new UserIdentity(web3, `0x${entity1Keystore.address}`, entity1PrivateKey)

// Im not sure if this is needed
async function unlockAccount() {
	let unlockedAccount = await web3.eth.personal.unlockAccount(entity1Identity.address, configData.addressPassword, 500)
	console.log('Account unlocked:', unlockedAccount)
	return unlockedAccount
}

let entity2KeyStore = keystoreDataEntity2;

async function mainAdd() {
	unlockAccount()
	console.log('\n ------ Example of adding the entity2 like a Service Provider ------ \n')
	let transaction = await transactionFactory.identityManager.addIdentityServiceProvider(web3, `0x${entity2KeyStore.address}`)
	let getKnownTx = await entity1Identity.getKnownTransaction(transaction)
	console.log('The transaction bytes data is: ', getKnownTx)
	web3.eth.sendSignedTransaction(getKnownTx)
	.on('transactionHash', function (hash) {
		console.log("HASH: ", hash)
	})
	.on('receipt', function (receipt) {
		console.log("RECEIPT: ", receipt)
	})
	.on('error', function (error) {
		console.error(error)
		process.exit(1);
	});
	// If this is a revert, probably this Subject (address) is already a SP
}

mainAdd()