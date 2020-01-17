const { transactionFactory, UserIdentity } = require('alastria-identity-lib')
let Web3 = require('web3')
let fs = require('fs')
let keythereum = require('keythereum')

let rawdata = fs.readFileSync('../configuration.json')
let configData = JSON.parse(rawdata)

let keyDataEntity1 = fs.readFileSync('../keystores/entity1-a9728125c573924b2b1ad6a8a8cd9bf6858ced49.json')
let keystoreDataEntity1 = JSON.parse(keyDataEntity1)
let keyDataAdmin = fs.readFileSync('../keystores/admin-6e3976aeaa3a59e4af51783cc46ee0ffabc5dc11.json')
let keystoreDataAdmin = JSON.parse(keyDataAdmin)

// Init your blockchain provider
let myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

let adminKeyStore = keystoreDataAdmin

let adminPrivateKey
try {
	adminPrivateKey = keythereum.recover(configData.addressPassword, adminKeyStore)
} catch (error) {
	console.log("ERROR: ", error)
	process.exit(1);
}

let adminIdentity = new UserIdentity(web3, `0x${adminKeyStore.address}`, adminPrivateKey)

// Im not sure if this is needed
async function unlockAccount() {
	let unlockedAccount = await web3.eth.personal.unlockAccount(adminIdentity.address, configData.addressPassword, 3600)
	console.log('Account unlocked:', unlockedAccount)
	return unlockedAccount
}

let entity1KeyStore = keystoreDataEntity1;

async function mainDel() {
	unlockAccount()
	console.log('\n ------ Example of deleting the entity1 like Service Provider ------ \n')
	let transactionD = await transactionFactory.identityManager.deleteIdentityServiceProvider(web3, `0x${entity1KeyStore.address}`)
	console.log("transaction", transactionD)
	let getKnownTxD = await adminIdentity.getKnownTransaction(transactionD)
	console.log('The transaction bytes data is: ', getKnownTxD)
	web3.eth.sendSignedTransaction(getKnownTxD)
		.on('transactionHash', function (hashD) {
			console.log("HASH: ", hashD)
		})
		.on('receipt', function (receiptD) {
			console.log("RECEIPT: ", receiptD)
		})
		.on('error', function (error) {
			console.error(error)
			process.exit(1);
		});
}
mainDel()
