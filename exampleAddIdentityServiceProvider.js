const {transactionFactory, UserIdentity, config} = require('alastria-identity-lib')
let Web3 = require('web3')
let fs = require('fs')
let keythereum = require('keythereum')

let rawdata = fs.readFileSync('./configuration.json')
let configData = JSON.parse(rawdata)

// Init your blockchain provider
let myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

let adminKeyStore = configData.adminKeyStore

let adminPrivateKey
try{
	adminPrivateKey = keythereum.recover(configData.addressPassword, adminKeyStore)
}catch(error){
	console.log("ERROR: ", error)
}

let adminIdentity = new UserIdentity(web3, `0x${adminKeyStore.address}`, adminPrivateKey)

// Im not sure if this is needed
new Promise((resolver, rechazar) => {
web3.eth.personal.unlockAccount(adminIdentity.address,"Passw0rd", 500)
.then(() => {
	resolver(0);
}).catch(error=> {
	console.log(error);
	rechazar(error);
})});

let newSPKeyStore = configData.serviceProviderKeyStore; 

new Promise (async() => {
	console.log('\n ------ Example of adding a Service Provider ------ \n')
	let transactionA = await transactionFactory.identityManager.addIdentityServiceProvider(web3, `0x${newSPKeyStore.address}`)
	console.log("transaction", transactionA)
	let getKnownTxA = await adminIdentity.getKnownTransaction(transactionA)
	console.log('The transaction bytes data is: ', getKnownTxA)
	web3.eth.sendSignedTransaction(getKnownTxA)
	.on('transactionHash', function (hashA) {
		console.log("HASH: ", hashA)
	})
	.on('receipt', function (receiptA) {
		console.log("RECEIPT: ", receiptA)
		new Promise (async() => {
			console.log('\n ------ Example of deleting a Service Provider ------ \n')
			let transactionD = await transactionFactory.identityManager.deleteIdentityServiceProvider(web3, `0x${newSPKeyStore.address}`)
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
		})
	})
	.on('error', console.error); 
	// If this is a revert, probably this Subject (address) is already a SP
})
