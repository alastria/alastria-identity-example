const { transactionFactory, UserIdentity } = require('alastria-identity-lib')
const Web3 = require('web3')
const fs = require('fs')
const keythereum = require('keythereum')

const rawdata = fs.readFileSync('../configuration.json')
const configData = JSON.parse(rawdata)

const keyDataEntity3 = fs.readFileSync('../keystores/entity3-de7ab34219563ac50ccc7b51d23b9a61d22a383e.json')
const keystoreDataEntity3 = JSON.parse(keyDataEntity3)
const keyDataEntity1 = fs.readFileSync('../keystores/entity1-a9728125c573924b2b1ad6a8a8cd9bf6858ced49.json')
const keystoreDataEntity1 = JSON.parse(keyDataEntity1)

// Init your blockchain provider
const myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

const entity1KeyStore = keystoreDataEntity1

let entity1PrivateKey
try {
	entity1PrivateKey = keythereum.recover(configData.addressPassword, entity1KeyStore)
} catch (error) {
	console.log("ERROR: ", error)
	process.exit(1);
}

const entity1Identity = new UserIdentity(web3, `0x${entity1KeyStore.address}`, entity1PrivateKey)

// Im not sure if this is needed
async function unlockAccount() {
	const unlockedAccount = await web3.eth.personal.unlockAccount(entity1Identity.address, configData.addressPassword, 500)
	console.log('Account unlocked:', unlockedAccount)
	return unlockedAccount
}

const entity3KeyStore = keystoreDataEntity3;

async function mainAddEntity(){
	unlockAccount()
	console.log('\n ------ Example of adding the entity1 like a Entity ------ \n')
	const transactionAddEntity = await transactionFactory.identityManager.addEntity(web3, configData.didEntity3, configData.entityData3.name,
		configData.entityData3.cif, configData.entityData3.urlLogo, configData.entityData3.urlCreateAID, configData.entityData3.urlAOA, 
		configData.entityData3.status)
	const getKnownTxAddEntity = await entity1Identity.getKnownTransaction(transactionAddEntity)
	console.log('The transaction bytes data is: ', getKnownTxAddEntity)
	web3.eth.sendSignedTransaction(getKnownTxAddEntity)
		.on('transactionHash', function (hashAddEntity) {
			console.log("HASH: ", hashAddEntity)
		})
		.on('receipt', function (receiptAddEntity) {
			console.log("RECEIPT: ", receiptAddEntity)
		})

		.on('error', function (error) {
			console.error(error)
			process.exit(1);
		});// If this is a revert, probably this Subject (address) is already a SP
}

mainAddEntity()