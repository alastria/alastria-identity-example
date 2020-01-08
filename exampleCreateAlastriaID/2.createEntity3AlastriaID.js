const {transactionFactory, UserIdentity, config, tokensFactory} = require('alastria-identity-lib')
const fs = require('fs')
const Web3 = require('web3')
const keythereum = require('keythereum')

let rawdata = fs.readFileSync('../configuration.json')
let configData = JSON.parse(rawdata)

let keyData = fs.readFileSync('../keystore/keystore.json')
let keystoreData = JSON.parse(keyData)

// Init your blockchain provider
let myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

console.log('\n ------ Example of prepare Alastria ID, addKey and createAlastriaID necessary to have an Alastria ID ------ \n')
// Data
const rawPublicKey = configData.rawPublicKeySubject

let entity1KeyStore = keystoreData.entity1

let entity1PrivateKey
try{
	entity1PrivateKey = keythereum.recover(keystoreData.addressPassword, entity1KeyStore)
}catch(error){
	console.log("ERROR: ", error)
}

let entity1Identity = new UserIdentity(web3, `0x${entity1KeyStore.address}`, entity1PrivateKey)

let entity3Keystore = keystoreData.entity3

let entity3PrivateKey
try{
	entity3PrivateKey = keythereum.recover(keystoreData.addressPassword, entity3Keystore)
}catch(error){
	console.log("ERROR: ", error)
}

let entity3Identity = new UserIdentity(web3, `0x${entity3Keystore.address}`, entity3PrivateKey)
// End data

function preparedAlastriaId() {
	let preparedId = transactionFactory.identityManager.prepareAlastriaID(web3, entity3Keystore.address)
	return preparedId
}

function createAlastriaId() {
	let txCreateAlastriaID = transactionFactory.identityManager.createAlastriaIdentity(web3, rawPublicKey)
	return txCreateAlastriaID
}

console.log('\n ------ Step three---> A promise all where prepareAlastriaID and createAlsatriaID transactions are signed and sent ------ \n')
async function main() {
	let prepareResult = await preparedAlastriaId()
	let createResult = await createAlastriaId()

	let signedPreparedTransaction = await entity1Identity.getKnownTransaction(prepareResult)
	let signedCreateTransaction =	await entity3Identity.getKnownTransaction(createResult)
	console.log("---->signedCreateTransaction<----",signedCreateTransaction)
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
					data: web3.eth.abi.encodeFunctionCall(config.contractsAbi['AlastriaIdentityManager']['identityKeys'], [entity3Keystore.address])
				})
				.then (AlastriaIdentity => {
					console.log(`alastriaProxyAddress: 0x${AlastriaIdentity.slice(26)}`)
					configData.entity3 = `0x${AlastriaIdentity.slice(26)}`
					fs.writeFileSync('../configuration.json', JSON.stringify(configData))
					let alastriaDID = tokensFactory.tokens.createDID('quor', AlastriaIdentity.slice(26));
					configData.didEntity3 = alastriaDID
					fs.writeFileSync('../configuration.json', JSON.stringify(configData))
					console.log('the alastria DID is:', alastriaDID)
				})
		})
		.on('error', console.error); // If a out of gas error, the second parameter is the receipt.
	})
	.on('error', console.error); // If a out of gas error, the second parameter is the receipt.
}

main()

