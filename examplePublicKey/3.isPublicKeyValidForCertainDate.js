const { transactionFactory } = require('alastria-identity-lib')
const Web3 = require('web3')
const fs = require('fs')

const rawdata = fs.readFileSync('../configuration.json')
const configData = JSON.parse(rawdata)

const myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

if (configData.entity3 === undefined) {
  console.error('You must create an Alastria ID')
  process.exit(1)
}

console.log('We retrive the current public key for entity3')
const entity3PubKeyHash = `${web3.utils.sha3(configData.entity3Pubk.substr(2))}`
const getPubKTx = transactionFactory.publicKeyRegistry.getPublicKeyStatusHash(
  web3,
  configData.didEntity3,
  entity3PubKeyHash
)
web3.eth
  .call(getPubKTx)
  .then((result) => {
    const resultStatus = web3.eth.abi.decodeParameters(['bool', 'uint8', 'uint256', 'uint256'], result)
    const publicKeyStatus = {
      exist: resultStatus[0],
      status: resultStatus[1],
      startDate: resultStatus[2],
      endDate: resultStatus[3]
    }
    console.log('publicKeyStatus for Entity3 ------>', publicKeyStatus)

    const date = new Date();

    if (publicKeyStatus.endDate == 0) {
      console.log('The public key is valid for the date ' + date)
    } else if (publicKeyStatus.endDate >= date.getTime()) {
      console.log('The public key is valid for the date ' + date)
    } else {
      console.log('The public key is NOT valid for the date ' + date)
    }
  })
  .catch(function (error) {
    console.error('Something fails', error)
    process.exit(1)
  })
