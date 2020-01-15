const { transactionFactory, UserIdentity, config, tokensFactory } = require('alastria-identity-lib')
const fs = require('fs')
const Web3 = require('web3')
const keythereum = require('keythereum')

let rawdata = fs.readFileSync('../configuration.json')
let configData = JSON.parse(rawdata)

let keyDataEntity1 = fs.readFileSync('../keystores/entity1-a9728125c573924b2b1ad6a8a8cd9bf6858ced49.json')
let keystoreDataEntity1 = JSON.parse(keyDataEntity1)
let keyDataEntity2 = fs.readFileSync('../keystores/entity2-ad88f1a89cf02a32010b971d8c8af3a2c7b3bd94.json')
let keystoreDataEntity2 = JSON.parse(keyDataEntity2)

// Init your blockchain provider
let myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

console.log('\n ------ Example of prepare Alastria ID, addKey and createAlastrisID necessary to have an Alastria ID ------ \n')
// Data
const rawPublicKey = configData.rawPublicKeySubject

let entity1KeyStore = keystoreDataEntity1

let entity1PrivateKey
try {
	entity1PrivateKey = keythereum.recover(configData.addressPassword, entity1KeyStore)
} catch (error) {
	console.log("ERROR: ", error)
	process.exit(1);
}

let entity1Identity = new UserIdentity(web3, `0x${entity1KeyStore.address}`, entity1PrivateKey)

let entity2Keystore = keystoreDataEntity2

let entity2PrivateKey
try {
	entity2PrivateKey = keythereum.recover(configData.addressPassword, entity2Keystore)
} catch (error) {
	console.log("ERROR: ", error)
	process.exit(1);
}

let entity2Identity = new UserIdentity(web3, `0x${entity2Keystore.address}`, entity2PrivateKey)
// End data

function preparedAlastriaId() {
	let preparedId = transactionFactory.identityManager.prepareAlastriaID(web3, entity2Identity.address)
	return preparedId
}

function createAlastriaId() {
	let txCreateAlastriaID = transactionFactory.identityManager.createAlastriaIdentity(web3, rawPublicKey)
	return txCreateAlastriaID
}

console.log('\n ------ A promise all where prepareAlastriaID and createAlsatriaID transactions are signed and sent ------ \n')
async function main() {
	let prepareResult = await preparedAlastriaId()
	let createResult = await createAlastriaId()

	let signedPreparedTransaction = await entity1Identity.getKnownTransaction(prepareResult)
	let signedCreateTransaction = await entity2Identity.getKnownTransaction(createResult)
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
						data: web3.eth.abi.encodeFunctionCall(config.contractsAbi['AlastriaIdentityManager']['identityKeys'], [entity2Keystore.address])
					})
						.then(AlastriaIdentity => {
							console.log(`alastriaProxyAddress: 0x${AlastriaIdentity.slice(26)}`)
							configData.entity2 = `0x${AlastriaIdentity.slice(26)}`
							fs.writeFileSync('../configuration.json', JSON.stringify(configData))
							let alastriaDID = tokensFactory.tokens.createDID('quor', AlastriaIdentity.slice(26));
							configData.didEntity2 = alastriaDID
							fs.writeFileSync('../configuration.json', JSON.stringify(configData))
							console.log('the alastria DID is:', alastriaDID)
						})
				})

				.on('error', function (error) {
					console.error(error)
					process.exit(1);
				}); // If a out of gas error, the second parameter is the receipt.
		})

		.on('error', function (error) {
			console.error(error)
			process.exit(1);
		}); // If a out of gas error, the second parameter is the receipt.
}

main()

