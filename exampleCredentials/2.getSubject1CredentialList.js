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

	if(configData.didSubject1 == undefined) {
		console.log('You must create an Alastria ID')
		process.exit()
	}

	let credentialList = transactionFactory.credentialRegistry.getSubjectCredentialList(web3, configData.didSubject1)
	console.log('(credentialList) Transaction ------>', credentialList)
	web3.eth.call(credentialList)
	.then(subjectCredentialList => {
		console.log('(subjectCredentialList) Transaction ------->', subjectCredentialList)
		let resultList = web3.eth.abi.decodeParameters(["uint256", "bytes32[]"], subjectCredentialList)
		let credentialList = {
			"uint": resultList[0],
			"bytes32[]": resultList[1]
		}
		console.log('(subjectCredentialList) TransactionList: ', credentialList)
	})
	.catch(errorList => {
		console.log('Error List -----> ', errorList)
	})