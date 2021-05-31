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

if (configData.subject1 === undefined) {
  console.error('You must create an Alastria ID')
  process.exit(1)
}

const entitiesList = transactionFactory.alastriaNameService.entitiesList(web3)
console.log('(entitiesList) Transaction ------>', entitiesList)
web3.eth
  .call(entitiesList)
  .then((listEntities) => {
    console.log('(entitiesList) Transaction ------->', listEntities)
    const resultList = web3.eth.abi.decodeParameter('address[]', listEntities)
    console.log('(entitiesList) TransactionList: ', resultList)
  })
  .catch((errorList) => {
    console.error('Error List -----> ', errorList)
    process.exit(1)
  })
