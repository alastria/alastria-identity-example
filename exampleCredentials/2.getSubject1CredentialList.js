const { transactionFactory } = require('alastria-identity-lib')
const Web3 = require('web3')
const fs = require('fs')

const rawdata = fs.readFileSync('../configuration.json')
const configData = JSON.parse(rawdata)

// Init your blockchain provider
const myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

// ------------------------------------------------------------------------------
console.log('\n ------ Getting Credential List os Subject1 ------ \n')

if (configData.didSubject1 === undefined) {
  console.error('You must create an Alastria ID')
  process.exit(1)
}

const credentialList = transactionFactory.credentialRegistry.getSubjectCredentialList(
  web3,
  configData.didSubject1
)
console.log('(credentialList) Transaction ------>', credentialList)
web3.eth
  .call(credentialList)
  .then((subjectCredentialList) => {
    console.log(
      '(subjectCredentialList) Transaction ------->',
      subjectCredentialList
    )
    const resultList = web3.eth.abi.decodeParameters(
      ['uint256', 'bytes32[]'],
      subjectCredentialList
    )
    const credentialList = {
      uint: resultList[0],
      'bytes32[]': resultList[1]
    }
    console.log('(subjectCredentialList) TransactionList: ', credentialList)
  })
  .catch((errorList) => {
    console.error('Error List -----> ', errorList)
    process.exit(1)
  })
