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

console.log('\n ------ Example of prepare Alastria ID, addKey and createAlastriaID necessary to have an Alastria ID ------ \n')
// Data
const rawPublicKey = configData.rawPublicKeySubject

let issuerKeystore = keystoreData.issuerKeystore

let issuerPrivateKey
try{
	issuerPrivateKey = keythereum.recover(keystoreData.addressPassword, issuerKeystore)
}catch(error){
	console.log("ERROR: ", error)
}

let issuerIdentity = new UserIdentity(web3, `0x${issuerKeystore.address}`, issuerPrivateKey)

let subjectKeystore = keystoreData.subjectKeystore

let subjectPrivateKey
try{
	subjectPrivateKey = keythereum.recover(keystoreData.addressPassword, subjectKeystore)
}catch(error){
	console.log("ERROR: ", error)
}

let subjectIdentity = new UserIdentity(web3, `0x${subjectKeystore.address}`, subjectPrivateKey)
// End data

function preparedAlastriaId() {
	let preparedId = transactionFactory.identityManager.prepareAlastriaID(web3, subjectKeystore.address)
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

	let signedPreparedTransaction = await issuerIdentity.getKnownTransaction(prepareResult)
	let signedCreateTransaction =	await subjectIdentity.getKnownTransaction(createResult)
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
					data: web3.eth.abi.encodeFunctionCall(config.contractsAbi['AlastriaIdentityManager']['identityKeys'], [issuerKeystore.address])
				})
				.then (AlastriaIdentity => {
					console.log(`alastriaProxyAddress: 0x${AlastriaIdentity.slice(26)}`)
					configData.subject = `0x${AlastriaIdentity.slice(26)}`
					fs.writeFileSync('../configuration.json', JSON.stringify(configData))
					let alastriaDID = tokensFactory.tokens.createDID('quor', AlastriaIdentity.slice(26));
					console.log('the alastria DID is:', alastriaDID)
				})
		})
		.on('error', console.error); // If a out of gas error, the second parameter is the receipt.
	})
	.on('error', console.error); // If a out of gas error, the second parameter is the receipt.
}

main()

