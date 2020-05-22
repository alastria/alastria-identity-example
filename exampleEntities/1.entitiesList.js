const {transactionFactory} = require('alastria-identity-lib')
let Web3 = require('web3')
let fs = require('fs')

let rawdata = fs.readFileSync('../configuration.json')
let configData = JSON.parse(rawdata)

// Init your blockchain provider
let myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

//------------------------------------------------------------------------------
console.log('\n ------ Getting Credential List os Subject1 ------ \n')

	if(configData.subject1 == undefined) {
		console.log('You must create an Alastria ID')
		process.exit()
	}

	let entitiesList = transactionFactory.identityManager.entitiesList(web3)
	console.log('(entitiesList) Transaction ------>', entitiesList)
	web3.eth.call(entitiesList)
	.then(listEntities => {
		console.log('(entitiesList) Transaction ------->', listEntities)
		let resultList = web3.eth.abi.decodeParameter("address[]", listEntities)
		console.log('(entitiesList) TransactionList: ', resultList)
	})
	.catch(errorList => {
		console.log('Error List -----> ', errorList)
	})
