const {transactionFactory} = require('alastria-identity-lib')
const Web3 = require('web3')
const fs = require('fs')

const rawdata = fs.readFileSync('../configuration.json')
const configData = JSON.parse(rawdata)

// Init your blockchain provider
const myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))



// ------------------------------------------------------------------------------
console.log('\n ------ Getting entity info ------ \n')

	if(configData.subject1 === undefined) {
		console.log('You must create an Alastria ID')
		process.exit()
	}

	// let entityData = transactionFactory.identityManager.getEntity(web3, entity1Identity.address)
	const entityData = transactionFactory.identityManager.getEntity(web3, configData.didEntity1)
	console.log('(entityData) Transaction ------>', entityData)
	web3.eth.call(entityData)
	.then(entityInfo => {
		console.log('(entityInfo) Transaction ------->', entityInfo)
		const resultList = web3.eth.abi.decodeParameters(["string", "string", "string", "string", "string", "bool"], entityInfo)
        const data = {
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
