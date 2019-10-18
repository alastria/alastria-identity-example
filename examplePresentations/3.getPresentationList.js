const {transactionFactory} = require('alastria-identity-lib')
let Web3 = require('web3')
let fs = require('fs')

let rawdata = fs.readFileSync('../configuration.json')
let configData = JSON.parse(rawdata)

// Init your blockchain provider
let myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

//------------------------------------------------------------------------------
console.log('\n ------ Getting Presentation List ------ \n')

	let subject = configData.subject
	let presentationList = transactionFactory.presentationRegistry.getSubjectPresentationList(web3, subject)
	console.log('(presentationList) Transaction ------>', presentationList)
	web3.eth.call(presentationList)
	.then(subjectPresentationList => {
		console.log('(subjectPresentationList) Transaction ------->', subjectPresentationList)
		let resultList = web3.eth.abi.decodeParameters(["uint256", "bytes32[]"], subjectPresentationList)
		let presentationListresult = {
			"uint": resultList[0],
			"bytes32[]": resultList[1]
		}
		console.log('(presentationListresult) TransactionList: ', presentationListresult)
	})
	.catch(errorList => {
		console.log('Error List -----> ', errorList)
	})