const {transactionFactory, UserIdentity} = require('alastria-identity-lib')
let Web3 = require('web3')
let fs = require('fs')
let keythereum = require('keythereum')

let rawdata = fs.readFileSync('../configuration.json')
let configData = JSON.parse(rawdata)

// Init your blockchain provider
let myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

let keyDataEntity1 = fs.readFileSync('../keystores/entity1-a9728125c573924b2b1ad6a8a8cd9bf6858ced49.json')
let keystoreDataEntity1 = JSON.parse(keyDataEntity1)

let entity1KeyStore = keystoreDataEntity1

let entity1PrivateKey
try{
	entity1PrivateKey = keythereum.recover(configData.addressPassword, entity1KeyStore)
}catch(error){
	console.log("ERROR: ", error)
}

let entity1Identity = new UserIdentity(web3, `0x${entity1KeyStore.address}`, entity1PrivateKey)

//------------------------------------------------------------------------------
console.log('\n ------ Getting entity info ------ \n')

	if(configData.subject1 == undefined) {
		console.log('You must create an Alastria ID')
		process.exit()
	}

	//let entityData = transactionFactory.identityManager.getEntity(web3, entity1Identity.address)
	let entityData = transactionFactory.identityManager.getEntity(web3, entity1Identity.address)
	console.log('(entityData) Transaction ------>', entityData)
	web3.eth.call(entityData)
	.then(entityInfo => {
		console.log('(entityInfo) Transaction ------->', entityInfo)
		let resultList = web3.eth.abi.decodeParameters(["string", "string", "string", "string", "string", "bool"], entityInfo)
        let data = {
            "name": resultList[0],
            "cif":resultList[1],
            "urlLogo":resultList[2],
            "urlCreateAID":resultList[3],
            "urlAOA":resultList[4],
            "status":resultList[5]
		}
        console.log('(Entity) TransactionList: ', data)
	})
	.catch(errorList => {
		console.log('Error List -----> ', errorList)
	})