const { transactionFactory, UserIdentity } = require('alastria-identity-lib')
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
try {
	adminPrivateKey = keythereum.recover(keystoreData.addressPassword, adminKeyStore)
} catch (error) {
	console.log("ERROR: ", error)
}

let adminIdentity = new UserIdentity(web3, `0x${adminKeyStore.address}`, adminPrivateKey)

// Im not sure if this is needed
async function unlockAccount() {
	let unlockedAccount = await web3.eth.personal.unlockAccount(adminIdentity.address, keystoreData.addressPassword, 3600)
	console.log('Account unlocked:', unlockedAccount)
	return unlockedAccount
}

let entity1KeyStore = keystoreData.entity1;
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
		.on('error', console.error);
}
mainDel()
