const { transactionFactory } = require('alastria-identity-lib')
const Web3 = require('web3')
const fs = require('fs')

const rawdata = fs.readFileSync('../configuration.json')
const configData = JSON.parse(rawdata)

// Init your blockchain provider
const myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

// ------------------------------------------------------------------------------
console.log('\n ------ Getting Presentation List ------ \n')

if (configData.didSubject1 === undefined) {
  console.error('You must create an Alastria ID')
  process.exit(1)
}

const presentationList = transactionFactory.presentationRegistry.getSubjectPresentationList(
  web3,
  configData.didSubject1
)
console.log('(presentationList) Transaction ------>', presentationList)
web3.eth
  .call(presentationList)
  .then((subject1PresentationList) => {
    console.log(
      '(subjectPresentationList) Transaction ------->',
      subject1PresentationList
    )
    const resultList = web3.eth.abi.decodeParameters(
      ['uint256', 'bytes32[]'],
      subject1PresentationList
    )
    const presentationListresult = {
      uint: resultList[0],
      'bytes32[]': resultList[1]
    }
    console.log(
      '(presentationListresult) TransactionList: ',
      presentationListresult
    )
  })
  .catch((errorList) => {
    console.error('Error List -----> ', errorList)
    process.exit(1)
  })
