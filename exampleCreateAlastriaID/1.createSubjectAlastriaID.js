const {transactionFactory, UserIdentity, config, tokensFactory} = require('alastria-identity-lib')
const fs = require('fs')
const Web3 = require('web3')
const keythereum = require('keythereum')

let rawdata = fs.readFileSync('../configuration.json')
let configData = JSON.parse(rawdata)

let keyData = fs.readFileSync('../keystore.json')
let keystoreData = JSON.parse(keyData)

// Init your blockchain provider
let myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

console.log('\n ------ Example of prepare Alastria ID, addKey and createAlastrisID necessary to have an Alastria ID ------ \n')
// Data
const rawPublicKey = configData.rawPublicKeySubject

let adminKeyStore = keystoreData.adminKeystore

let adminPrivateKey
try{
	adminPrivateKey = keythereum.recover(keystoreData.addressPassword, adminKeyStore)
}catch(error){
	console.log("ERROR: ", error)
}

let adminIdentity = new UserIdentity(web3, `0x${adminKeyStore.address}`, adminPrivateKey)

let identityKeystore = keystoreData.identityKeystore

let subjectPrivateKey
try{
	subjectPrivateKey = keythereum.recover(keystoreData.addressPassword, identityKeystore)
}catch(error){
	console.log("ERROR: ", error)
}

let subjectIdentity = new UserIdentity(web3, `0x${identityKeystore.address}`, subjectPrivateKey)
// End data

let promisePreparedAlastriaId = new Promise (async(resolve, reject) => {
	let preparedId = await transactionFactory.identityManager.prepareAlastriaID(web3, identityKeystore.address)
	resolve(preparedId)
})

let promiseCreateAlastriaId = new Promise(async(resolve, reject) => {
	let txCreateAlastriaID = await transactionFactory.identityManager.createAlastriaIdentity(web3, rawPublicKey)
	resolve(txCreateAlastriaID)
})

console.log('\n ------ Step three---> A promise all where prepareAlastriaID and createAlsatriaID transactions are signed and sent ------ \n')
Promise.all([promisePreparedAlastriaId, promiseCreateAlastriaId])
.then(async result => {
	let signedCreateTransaction =	await subjectIdentity.getKnownTransaction(result[1])
	let signedPreparedTransaction = await adminIdentity.getKnownTransaction(result[0])
	web3.eth.sendSignedTransaction(signedPreparedTransaction)
	.on('transactionHash', function (hash) {
		console.log("HASH: ", hash)
	})
	.on('receipt', function (receipt) {
		console.log("RECEIPT: ", receipt)
		web3.eth.sendSignedTransaction(signedCreateTransaction)
		.on('transactionHash', function (hash) {
				console.log("HASH: ", hash)
		})
		.on('receipt', function (receipt) {
				console.log("RECEIPT: ", receipt)
				web3.eth.call({
					to: config.alastriaIdentityManager,				       
					data: web3.eth.abi.encodeFunctionCall(config.contractsAbi['AlastriaIdentityManager']['identityKeys'], [identityKeystore.address])
				})
				.then (AlastriaIdentity => {
					console.log(`alastriaProxyAddress: 0x${AlastriaIdentity.slice(26)}`)

					// TODO meter el subject en el config
					configData.subject = `0x${AlastriaIdentity.slice(26)}`
					fs.writeFileSync('../configuration.json', JSON.stringify(configData))
					let alastriaDID = tokensFactory.tokens.createDID('quor', AlastriaIdentity.slice(26));
					console.log('the alastria DID is:', alastriaDID)
				})
		})
		.on('error', console.error); // If a out of gas error, the second parameter is the receipt.
	})
	.on('error', console.error); // If a out of gas error, the second parameter is the receipt.
})

